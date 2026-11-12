# Vivek's portfolio

Interactive portfolio of Jatangi Anjan Vivek: a warm 1990s room whose panoramic window looks
out at modern Hyderabad. The room is the navigation. VHS tapes go into the VCR and the CRT
television plays each portfolio section. A clean standard version is always one click away.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open the address Vite prints, normally http://localhost:5173.

| Address | What it shows |
| --- | --- |
| `/` | The visitor's last choice, the 3D room by default |
| `/?mode=standard` | The standard portfolio |
| `/?mode=immersive` | The 3D room |
| `/?webgl=off` | Simulates a browser without WebGL, to preview the fallback |

## Deploy

```bash
npm run build
```

The site is fully static. Upload the `dist/` folder to any static host. The build uses relative
paths, so it works at a domain root (Vercel, Netlify, Cloudflare Pages) and under a sub-path
(GitHub Pages) with no extra configuration. On Vercel or Netlify, set the build command to
`npm run build` and the output folder to `dist`.

## Where to add your own material

Everything is in `src/data/`. Nothing in the 3D scene needs to change.

| What | File | Field |
| --- | --- | --- |
| GitHub repository links | `src/data/projects.ts` | `repoUrl` on each project |
| Project screenshots | `src/data/projects.ts` | `src` in each `screenshots` entry |
| Certificate images and verify links | `src/data/certifications.ts` | `image`, `verifyUrl` |
| LinkedIn profile, resume PDF | `src/data/profile.ts` | `linkedin`, `resumeUrl` |
| Contact form backend | `src/data/site.ts` | `CONTACT_ENDPOINT` |
| Text of any section | the matching file in `src/data/` | |
| Tape labels and colours | `src/data/sections.ts` | `tapes` |

Put image files in `public/assets/projects/` and `public/assets/certificates/`, then reference
them as, for example, `assets/projects/ai-sql-1.png`.

Anything still set to `null` shows as a clearly marked "to be added" placeholder. No link,
screenshot or certificate is invented.

The contact form opens the visitor's own email app while `CONTACT_ENDPOINT` is `null`, and it
never claims a message was sent. Set the constant to a form backend URL (for example a Formspree
endpoint) to send messages directly.

## What works

- **Room:** desk, chair, CRT television, VCR, eight VHS tapes on a rack, vintage computer with
  keyboard and mouse, speakers, rotary telephone, typewriter, bookshelf with books and magazines,
  notebook, wall clock showing real time, desk lamp, pendant lamp, plants, posters, pinned
  photographs, cassettes, floppy disks, curtains and rug.
- **City:** glass towers with windows that switch on and off, an elevated metro viaduct with two
  three-car trains, moving road traffic, streetlights, distant city lights, evening sky with
  stars and a moon, and a reflection of the room on the window glass.
- **Signature flow:** click a tape. It lifts off the rack, travels to the VCR, slides into the
  slot, the VCR display changes, the television plays a short startup and then shows the section
  as real, selectable HTML on the glass. Eject with the on-screen button, the bar under the
  screen or `Esc`.
- **Other objects:** computer (skills), bookshelf (education and certifications), telephone
  (contact), photographs (about and achievements), notebook (a short note).
- **Camera:** drag to look around, scroll to zoom, within limits that keep you inside the room.
  Viewpoint buttons for the room, desk, tapes and window. Smooth glides between views.
- **Index menu:** every tape and object is also reachable from the Index button, for keyboard
  and touch users.
- **Standard mode:** every section on one accessible page. It does not load three.js.
- **Fallbacks:** no WebGL, a lost graphics context or a scene error all switch to standard mode
  with an explanation. The loading screen shows real progress and can be skipped.
- **Small screens:** a simplified room, and sections open as a full-screen television panel.
- **Reduced motion:** the operating-system preference shortens every animation and stops the
  ambient movement.
- **Sound:** synthesised in the browser, off until the visitor presses the sound button.

## Known limits

- All 3D objects are built in code from simple shapes with generated textures. Blender was not
  available, so there are no sculpted models and no baked lighting.
- The skyline is inspired by HITEC City. It is not a model of specific real buildings.
- Sound has been checked for errors but not listened to.
- Testing was done in one Chromium browser at desktop and phone sizes. Safari, Firefox and real
  phones have not been tried.

## Structure

```
src/
  data/         all portfolio content and its TypeScript types
  store/        the state machine (loading, room, tape, television, eject, object panels)
  audio/        Web Audio sound synthesis
  components/   standard page, section content, television picture, HUD, loader, panels
  experience/   the 3D room
    Room/  CRT/  VHS/  City/  Metro/  Window/  Camera/  Lighting/  Interactions/  textures/
  styles/
```
