## ComfyUI NOTES:

### 2025 - August

### 1. **Dickgirl**

Currently, Dickgirls can only be generated in basic Flux mode, using **麦橘超然majicFlus\_v1.safetensors** + **loras/flux/penis.safetensors**.

The former model can be obtained from [liblib.ai](http://www.liblib.ai), and the latter is actually a Lora model for Flux 1, called **AndroFlux**, downloadable at [Civitai - AndroFlux](https://civitai.com/models/628763/androflux). Very cool.

### 2. **Image Size**

Workflows that involve two or more input images (except for face swap) require careful **image size handling**. Typically, the dimensions should remain consistent throughout.

The custom node **'LayerUtility: ImageBlendAdvance'** is helpful because it allows you to manually scale the foreground image and provides a preview function so you can adjust and ensure both input images fit proportionally.

### 3. **Background Replacement**

To change the background of one image with another, the **image stitch** approach for Flux Kontext works poorly if one image is a character with background and the other is purely a background. This workflow is demonstrated by 'portrait+environment.png' and 'portrait+environment-2.png' stored in the 'basics' folder. However, they are very unstable, with a success rate of only about 10%.

Instead, I prefer 'portrait+environment-3.png' in the 'my\_fav' folder. This version removes the background from the first image and overlays it onto the second image (using Normal blend mode, instead of Overlay) to merge into one picture. This image can then be used as the **ONLY INPUT IMAGE** in the normal Flux Kontext workflow.

### 4. **Clothes Replacement**

The current **换衣服.png** under my\_fav folder is usable, but not ideal. Tips to improve:

* Ensure all images have the same size.
* Make sure the character and clothes are similarly sized.
* Avoid major objects (e.g., arms or handbags) that obscure the clothes.
* The target clothes should be less revealing than the original, with the ideal being underwear.

### 5. **Multiple Characters**

Currently, **麦橘超然majicFlus\_v1** + a good matching Lora can create the illusion of a crowd in the blurry background. To create a real second character, especially a male character, the background replacement workflow described above might work well.

You can simply remove the background of the male character and position him over the second image, ensuring both characters maintain proportional size relative to each other. Some extra works in prompts are expected, for instance, making the male character much taller than the female character.

### 6. **Inpainting**

Inpainting is essential for fine-tuning workflows. Currently, we have workflows that allow us to redraw poorly rendered body parts or only focus on adding male genitalia. **Yummy!**

For adjusting the female character’s proportions, I recommend using the **Meitu app** for iOS. It does an excellent job adjusting head size, leg length, waist girth, shoulder width, and more.

### 7. **Manga to Realistic Photo**

This has been a pleasant surprise, although I haven’t figured out how to make it a consistent part of my workflow.

I initially thought about re-rendering classic manga series like *Ranma 1/2*, *Family Compo*, *仆少女*, and *短裙x放学后*. However, they have too much noise to clean up.

But the possibility of making this happen makes me extremely excited because turning gender-bender manga characters into real life figures have always had a special place in my heart. I still remember in the fall of 2007, I cosplayed a character from *同居非男孩* and ended up with a photo I still enjoy today.

### 8. **Storytelling Versatility**

To better aid storytelling in our **Story Builder** application, both versatility and consistency must be well-implemented. Currently, the 3-in-1 workflow combining **comfyui + internet search + inzoi** (or other 3D tools) should cover:

#### Character Versatility

Create a female character with various hairstyles, clothes, lighting, angles, and distances. This is mostly handled by **inzoi**, where textures and colors can be customized for a wide range of clothes styles.

The internet search (e.g., YouTube, Xiuren, Xiaohongshu) provides fresh, human-inspired input, which is crucial for CIAG. **Face swap** is a key tool for this workflow.

What we really take away from this is not the final drawings but rather a foundational **定妆照** that Flux Kontext will later use.

**IMPORTANT NOTE**: The sketch photo needs to be high-quality because we currently lack a good workflow for improving photo quality.

#### Character Consistency

As mentioned earlier, **Flux Kontext** excels at maintaining character consistency.

#### Location Versatility

Create images of the main character in any location and background. This can be easily achieved with **inzoi** or other 3D tools, using online 360 virtual tours, or snapshots from room tour videos (e.g., YouTube, Xiaohongshu). Flux can also generate a variety of backgrounds if consistency isn't a priority.

#### Location Consistency

3D tools ensure location consistency.

#### Character Animation

While **face-swapped videos** can satisfy non-storytelling needs, they aren't ideal for storytelling unless the entire story revolves around a real human video where the main female character is face-swapped. However, this limits imagination and creative possibilities.

**Inzoi's character animation** is limited but can work well for basic scenarios or daily routines such as cooking, shopping, walking, or chatting.

Currently, video-generative AI tools aren't used much, for various reasons. So for **Story Builder**, it's better to focus on graphics rather than animation. However, the occasional use of those faceswapped videos of Korean Youtubers definitely provides some of the highly anticipated and sexually-arousing moments in the final **Story Builder** pieces. **This is crucial! Haha.**

#### Narrative Gesture and Expression

This involves presenting characters with certain body gestures, facial expressions, or both, based on the narrative need or emotional tone of the story. For example, the girl and her boyfriend riding on the same motorcycle.

This is difficult but possible. I need to collect more comfyui workflows or Loras from platforms like **liblib.art**, **openart.ai**, **civitai**, **reddit**, **xiaohongshu**, and **公众号**. I remember a **Lora** named "骑自行车的女孩" on **liblib.ai**, which could serve this purpose.

While previous stable diffusion models used **ControlNet** for this task, the results were less controllable. I haven’t yet explored Flux enough to fully assess its potential, but I’m cautiously optimistic.

#### Interactions Between Characters

This is the most challenging and tedious part. However, **Photoshop** might offer a surprisingly useful workaround. Here's a potential workflow:

1. Find a similar shot from a **短剧** or TV drama where male and female characters interact in a similar way to what’s needed for **Story Builder**.
2. Use the **Manga to Realistic Photo** workflow to convert the image into one we can control for faces and clothes.
3. Use Photoshop or inpainting workflows to fine-tune details and remove inconsistencies.

I haven’t tested this fully, but the theory is promising. However, when workflows become too complicated and involve too many tools, they can become counterintuitive, draining my energy and taking away much of the fun. I need to find a balance between ease and quality, just like I did with those YouTube face-swapped videos: I turned them into a vision in the female character's mind—something she imagines when she's in the mood, or perhaps as part of an occasional cross-dressing experience to try on clothes, like a lookbook photoshoot.

Then the question becomes: Do interactions between characters deserve so much effort when all we need is an exciting story-reading or TV-watching experience?
