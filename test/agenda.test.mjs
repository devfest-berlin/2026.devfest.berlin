import { after, describe, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const eleventyCli = join(repoRoot, "node_modules", "@11ty", "eleventy", "cmd.cjs");
const scheduleUrl = "https://devfest-berlin-2026.sessionize.com";
const workDirs = [];

after(() => {
  for (const workDir of workDirs) {
    rmSync(workDir, { recursive: true, force: true });
  }
});

/**
 * Builds the site in a throwaway copy of the repo, so site.json on disk is never touched.
 * `editSite` receives the parsed site.json and may change it before the build.
 */
function buildSite(editSite) {
  const workDir = mkdtempSync(join(tmpdir(), "devfest-agenda-test-"));
  workDirs.push(workDir);
  cpSync(join(repoRoot, "src"), join(workDir, "src"), { recursive: true });
  cpSync(join(repoRoot, "eleventy.config.js"), join(workDir, "eleventy.config.js"));
  cpSync(join(repoRoot, "package.json"), join(workDir, "package.json"));
  symlinkSync(join(repoRoot, "node_modules"), join(workDir, "node_modules"), "dir");

  const siteJsonPath = join(workDir, "src", "_data", "site.json");
  const site = JSON.parse(readFileSync(siteJsonPath, "utf8"));
  editSite(site);
  writeFileSync(siteJsonPath, JSON.stringify(site, null, 2));

  execFileSync(process.execPath, [eleventyCli, "--quiet"], { cwd: workDir, stdio: "pipe" });

  const readPage = (pagePath) => readFileSync(join(workDir, "_site", pagePath), "utf8");
  return {
    home: readPage("index.html"),
    agenda: readPage(join("agenda", "index.html")),
    lounge: readPage(join("vibe-lounge", "index.html")),
  };
}

/** Returns the inner HTML of the first `<div class="className">`, following nested divs to its own closing tag. */
function blockWithClass(html, className) {
  const openingTag = `<div class="${className}">`;
  const start = html.indexOf(openingTag);
  assert.notEqual(start, -1, `expected a ${openingTag} block`);
  const divTags = /<div\b|<\/div>/g;
  divTags.lastIndex = start + openingTag.length;
  let depth = 1;
  for (let tag = divTags.exec(html); tag; tag = divTags.exec(html)) {
    depth += tag[0] === "</div>" ? -1 : 1;
    if (depth === 0) {
      return html.slice(start + openingTag.length, tag.index);
    }
  }
  assert.fail(`${openingTag} is never closed`);
}

function anchorsWithText(html, text) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
    .filter(([, , inner]) => inner.replace(/<[^>]+>/g, "").trim() === text)
    .map(([, attributes]) => attributes);
}

function assertSafeExternalLink(attributes) {
  assert.match(attributes, new RegExp(`href="${scheduleUrl}"`));
  if (/target="_blank"/.test(attributes)) {
    assert.match(attributes, /rel="[^"]*\bnoopener\b[^"]*"/);
  }
}

function openSchedule(site) {
  site.agenda.schedule = { status: "open", buttonText: "View Agenda", url: scheduleUrl };
}

describe("agenda schedule switch", () => {
  test("open with a url: View Agenda links to Sessionize in the hero and on /agenda/", () => {
    const { home, agenda } = buildSite(openSchedule);

    const heroLinks = anchorsWithText(blockWithClass(home, "hero-actions"), "View Agenda");
    assert.equal(heroLinks.length, 1);
    assertSafeExternalLink(heroLinks[0]);

    const agendaLinks = anchorsWithText(blockWithClass(agenda, "agenda-status-actions"), "View Agenda");
    assert.equal(agendaLinks.length, 1);
    assertSafeExternalLink(agendaLinks[0]);
  });

  test("open with tickets and CFP closed: View Agenda still shows in the hero and on /agenda/", () => {
    const { home, agenda } = buildSite((site) => {
      openSchedule(site);
      site.tickets.status = "closed";
      site.cfp.status = "closed";
    });

    const heroLinks = anchorsWithText(blockWithClass(home, "hero-actions"), "View Agenda");
    assert.equal(heroLinks.length, 1);
    assertSafeExternalLink(heroLinks[0]);

    const agendaLinks = anchorsWithText(blockWithClass(agenda, "agenda-status-actions"), "View Agenda");
    assert.equal(agendaLinks.length, 1);
    assertSafeExternalLink(agendaLinks[0]);
    assert.ok(!agenda.includes("Call for Speakers Open"));
  });

  test("status soon: no View Agenda button anywhere", () => {
    const { home, agenda } = buildSite((site) => {
      openSchedule(site);
      site.agenda.schedule.status = "soon";
    });

    assert.equal(anchorsWithText(home, "View Agenda").length, 0);
    assert.equal(anchorsWithText(agenda, "View Agenda").length, 0);
    assert.ok(!home.includes(scheduleUrl));
    assert.ok(!agenda.includes(scheduleUrl));
  });

  test("open with an empty url: no View Agenda button anywhere", () => {
    const { home, agenda } = buildSite((site) => {
      openSchedule(site);
      site.agenda.schedule.url = "";
    });

    assert.equal(anchorsWithText(home, "View Agenda").length, 0);
    assert.equal(anchorsWithText(agenda, "View Agenda").length, 0);
  });

  test("the Agenda menu link still points to /agenda/", () => {
    const { home } = buildSite(openSchedule);

    const menu = home.match(/<nav class="gh-head-menu"[\s\S]*?<\/nav>/);
    assert.ok(menu, "expected the main navigation");
    const agendaMenuLinks = anchorsWithText(menu[0], "Agenda");
    assert.equal(agendaMenuLinks.length, 1);
    assert.match(agendaMenuLinks[0], /href="\/agenda\/"/);
  });
});

describe("vibe lounge page", () => {
  test("lists every challenge with its link", () => {
    const { lounge } = buildSite(() => {});
    assert.match(lounge, /The Backyard Barista/);
    assert.match(lounge, /launch-your-portfolio-website-with-ai/);
    assert.match(lounge, /launch-your-web-based-video-game-with-ai/);
    assert.match(lounge, /build-with-google-maps-platform-and-ai/);
  });

  test("home links to the lounge page", () => {
    const { home } = buildSite(() => {});
    assert.match(home, /href="\/vibe-lounge\/"/);
  });

  test("never links the badge or Cloud credit claim URLs", () => {
    const { home, agenda, lounge } = buildSite(() => {});
    for (const page of [home, agenda, lounge]) {
      assert.doesNotMatch(page, /devfest26-vibe-lounge/);
      assert.doesNotMatch(page, /goo\.gle\//);
      assert.doesNotMatch(page, /me\.developers\.google\.com/);
    }
  });

  test("shows the repo link only when repoUrl is set", () => {
    const hidden = buildSite((site) => {
      site.agenda.vibeLounge.repoUrl = "";
    });
    assert.doesNotMatch(hidden.lounge, /All challenges and the sprint flow/);
    const shown = buildSite((site) => {
      site.agenda.vibeLounge.repoUrl = "https://github.com/example/vibe-lounge";
    });
    assert.match(shown.lounge, /github\.com\/example\/vibe-lounge/);
  });
});
