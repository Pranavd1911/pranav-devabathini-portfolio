# Personalized avatar

Generated with the built-in image generation tool using the user-supplied photo as an identity reference. The original photo remains outside the public website.

Asset: `pranav-avatar-sprite.png` — 1774 × 887 PNG with transparency. Three equal horizontal frames: neutral, wave inward, wave outward. The generated dimensions differ from the requested dimensions while retaining the requested 2:1 sheet aspect ratio. CSS displays one frame at a time without modifying the original artwork.

## Final prompt

```text
Use case: style-transfer / identity-preserve.
Asset type: transparent PNG character animation sprite sheet for a personal portfolio website.
Input image: identity reference of Pranav. Preserve his recognizable face shape, medium-brown skin, thick side-swept black hair, dark eyes, thin moustache and short chin beard; no glasses. Preserve his black-and-light-gray buffalo-check shirt with rolled sleeves and slim silver wrist bangle. Remove the phone and the bathroom entirely.
Primary request: Create a charming personalized Bitmoji-style full-body cartoon avatar of this man, in a polished friendly 2.5D sticker illustration style: oversized expressive head, clean smooth outlines, soft dimensional shading, approachable slight smile. Dark slim trousers and simple white sneakers.
CRITICAL PRODUCTION LAYOUT: a single wide 3072 x 1536 image (2:1 aspect ratio), exactly THREE equal 1024 x 1536 portrait cells in one horizontal row. This is ONE character in THREE animation poses, not three different people. Each character uses exactly the same scale, face, torso, feet position, outfit, and front-facing camera. Character centerlines precisely at x=512, x=1536, x=2560 respectively, feet baseline y=1440 in all three cells, top of hair y=140. Keep each whole silhouette completely within its own cell, with generous transparent margins including raised hand. No grid lines, no panel borders, no labels, no text, no watermark.
Cell 1 (left third): friendly neutral standing pose, both arms relaxed down beside body, front facing.
Cell 2 (middle third): exact same body, head, legs and feet; his left arm on the viewer's RIGHT is raised beside his head, elbow bent, open palm waving with fingers angled inward toward his head.
Cell 3 (right third): exact same body, head, legs, feet, and raised upper arm as cell 2; only forearm/hand tilts outward away from head to create the second frame of the friendly hand wave.
Background: genuinely transparent alpha for the entire background, no painted checkerboard, no colored rectangle, no environment, no ground shadow.
Prioritize recognizable resemblance to the supplied photo and strict equal-cell sprite alignment.
```
