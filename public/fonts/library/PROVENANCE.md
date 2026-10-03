# Typeface library provenance

Release 1 brand typefaces. Upright only, weights 400 and 700. Taken from each
publisher's official repository or release, not from a CDN and not from an
npm package. Each shipped licence file states the SIL Open Font License,
Version 1.1. Where a file was converted, the tool is fontTools 4.58.2 using
its bundled brotli 1.1.0 woff2 writer. No package was added to the project.

Almarai was not shipped. See the note at the end.

| File | Family | Source | Release or commit | Bytes | SHA-256 | How it was made |
|---|---|---|---|---|---|---|
| `cairo-400.woff2` | Cairo | `https://github.com/Gue3bara/Cairo` `fonts/Cairo/variable/Cairo[slnt,wght].ttf` | `73d16933c6a0f341c27a69e401da83dcb0d53114` | 49484 | `65c7b8318bd83f0f3b15efad3d3cb822a67ea278885c0f49473d06a5d1dd049e` | fontTools instance at the named Regular: wght 400, slnt 0, then woff2 |
| `cairo-700.woff2` | Cairo | same variable file | same commit | 50528 | `9588ecfd98b7bfec77a537550606721a144c905861603c0a1a830b5868031a57` | fontTools instance at the named Bold: wght 700, slnt 0, then woff2 |
| `tajawal-400.woff2` | Tajawal | `https://github.com/googlefonts/tajawal` `fonts/ttf/Tajawal-Regular.ttf` | `2085b8942f234e7afb83dc03c77713d0d5471cc9` | 20776 | `0fd90ab9d15c6034666baf989db84990747f7c7fdbde915a940b70176feda990` | fontTools woff2 of the publisher static |
| `tajawal-700.woff2` | Tajawal | `fonts/ttf/Tajawal-Bold.ttf` | same commit | 20932 | `f3676f3da5cd4f6be3038c81c01f0f56a3762278a1bbedf4c8bcf8278c9a1592` | fontTools woff2 of the publisher static |
| `noto-naskh-arabic-400.woff2` | Noto Naskh Arabic | `https://github.com/notofonts/arabic` release `NotoNaskhArabic-v2.021` `NotoNaskhArabic/full/ttf/NotoNaskhArabic-Regular.ttf` | `59f5a3fd985bf24858915c3dddfc51a537640965` | 99536 | `264a307b59f2575b9ddc9b8b919fb941cf59f995433f388bf093ad5107b1bc5c` | fontTools woff2 of the publisher static |
| `noto-naskh-arabic-700.woff2` | Noto Naskh Arabic | `NotoNaskhArabic/full/ttf/NotoNaskhArabic-Bold.ttf` | same release | 104684 | `908beaeb7ebae1badbf3f1da41bfb07432c90288d3544580bb2745d9533b69b6` | fontTools woff2 of the publisher static |
| `amiri-400.woff2` | Amiri | `https://github.com/aliftype/amiri` `fonts/Amiri-Regular.ttf` | `6331fc82b0d20d9439a0792e21a9294ca015a93f` | 172264 | `44ce88e832a245b80a49ee66216837c567102191882837f59a4ff6b55d8af51e` | fontTools woff2 of the publisher static |
| `amiri-700.woff2` | Amiri | `fonts/Amiri-Bold.ttf` | same commit | 162044 | `bcd6a2ecdfb64b1adcd2488545bab7b73dbd45462757ba45428673fc76191569` | fontTools woff2 of the publisher static |
| `reem-kufi.woff2` | Reem Kufi | `https://github.com/aliftype/reem-kufi` `fonts/ReemKufi.ttf` | `3e52e56672d73e3016a2700e1abe2aac207f064a` | 49132 | `b4423b5b838e40ce822335d7fbf0d012511f43a806b8616633c8b9edcc2993ae` | fontTools woff2 of the variable file; axis wght 400–700 |
| `inter-400.woff2` | Inter | `https://github.com/rsms/inter` release `v4.1` `extras/woff-hinted/Inter-Regular.woff2` | tag `v4.1` | 140944 | `338239f6b590b8ced3bf857654d32da3fd3663294cd3003651ed57aa3abd7aa1` | publisher woff2, unmodified |
| `inter-700.woff2` | Inter | `extras/woff-hinted/Inter-Bold.woff2` | tag `v4.1` | 144636 | `98c66e49c299c5675426bf5562b1876c2b6b9bd8dc90a8922a49703ed4848813` | publisher woff2, unmodified |
| `montserrat-400.woff2` | Montserrat | `https://github.com/JulietaUla/Montserrat` `fonts/webfonts/Montserrat-Regular.woff2` | `555facfb2a18c72c3c0380f0d9c0f060453a9058` | 126576 | `6cf3e021436786e7ac49a0fe3fd6d7ec575431b2dff0dd42f53a4bb82808e2aa` | publisher woff2, unmodified |
| `montserrat-700.woff2` | Montserrat | `fonts/webfonts/Montserrat-Bold.woff2` | same commit | 130012 | `029f035451ce4e367b69e886afca615cc6dddf33b6bf33d6f967e79295c3031c` | publisher woff2, unmodified |
| `poppins-400.woff2` | Poppins | `https://github.com/itfoundry/Poppins` `products/Poppins-4.003-GoogleFonts-TTF.zip` `Poppins-Regular.ttf` | `be5b80d711415eccf6b65aad15bced8bbb6a67a2` | 51452 | `44641b8ae746b4cfed0c47f3b7701c8444544f233e435590a647c1dad6857f37` | fontTools woff2 of the publisher static |
| `poppins-700.woff2` | Poppins | `Poppins-Bold.ttf` in the same archive | same commit | 51060 | `d1a97975b77a491f3fd277ebf431fa23f0275a21e1ed533640fbbbe6f9f2758e` | fontTools woff2 of the publisher static |
| `fraunces.woff2` | Fraunces | `https://github.com/undercasetype/Fraunces` `fonts/webfonts/variable/Fraunces[SOFT,WONK,opsz,wght].woff2` | `7ccdec31c6028118dce3e47fe864e3744460371d` | 205500 | `e6638ea113d0027354a08f957a4068975c8066395a0d0f7bb7861f6409621be3` | publisher woff2, unmodified; wght covers 400 and 700 |
| `playfair-display.woff2` | Playfair Display | `https://github.com/clauseggers/Playfair` `fonts/VF-WOFF2/PlayfairRomanVF.woff2` | `b869b3a82f7188b4e790f9ef1ebe2d11630bde8f` | 652036 | `3641862de5d3b79b0313f1a7623875695c57829ad7587b478dbb803b5bc9121c` | publisher woff2, unmodified; the name table's typographic family is Playfair; wght covers 400 and 700; publisher defaults are opsz 5, wdth 88, wght 360 |
| `lora-400.woff2` | Lora | `https://github.com/cyrealtype/Lora-Cyrillic` `fonts/webfonts/Lora-Regular.woff2` | `2d53b449b60e185b39f671b44fded83e0910ad30` | 71292 | `0904f577a81f7840ea0c6bdfc75ab7c87ee6c4af315476e5fd25c478879f5b00` | publisher woff2, unmodified |
| `lora-700.woff2` | Lora | `fonts/webfonts/Lora-Bold.woff2` | same commit | 76960 | `c0e23c17a19d9b05d1f5bcc82997ff569b6d1aaa36df66cbf88b56c81cd8a627` | publisher woff2, unmodified |

Italic, medium, semibold, and the extra Reem Kufi Fun and Ink files were not
shipped. Inter's variable file was not shipped. Reserved Font Name "Lora" is
kept by shipping the publisher's files unmodified.

## Licences

Each row is the file shipped beside the fonts. Every one states: "This Font
Software is licensed under the SIL Open Font License, Version 1.1."

| File | Copyright line as shipped | Bytes | SHA-256 |
|---|---|---|---|
| `licences/cairo-OFL.txt` | Copyright 2009 The Cairo Project Authors | 4473 | `a4554e1799d42e1405924b61eb0e0722ae1623b1f1f07f995348f96c496362a9` |
| `licences/tajawal-OFL.txt` | Copyright 2018 Boutros International | 4462 | `04f4f5e3ff39bafcc63b9ff6aedf1d42aa26ab04e109dd2964fb537f1d0e5c45` |
| `licences/noto-naskh-arabic-OFL.txt` | Copyright 2022 The Noto Project Authors (https://github.com/notofonts/arabic) | 4382 | `a7a5a25eb188bf1cd96982030d53e23c33485c69b1044a562254226857ee13af` |
| `licences/amiri-OFL.txt` | Copyright 2010-2022 The Amiri Project Authors | 4389 | `72de68e5954f4fdd24702292ef5a32f003ca960ec9330dc86e5eefb5dffb9b22` |
| `licences/reem-kufi-OFL.txt` | Copyright 2015-2022 The Reem Kufi Project Authors | 4435 | `fedb204ccadda62524c5467136cef4968b6b67efdc6ca3e8752c1248d81e7f4e` |
| `licences/inter-LICENSE.txt` | Copyright (c) 2016 The Inter Project Authors | 4380 | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` |
| `licences/montserrat-OFL.txt` | Copyright 2024 The Montserrat.Git Project Authors | 4400 | `8b7141c03fa4f8d44e6345d5d4931709290f0f67875e452e95ac1fd3a027802e` |
| `licences/poppins-OFL.txt` | Copyright 2014-2019 Indian Type Foundry | 4371 | `fbc4c9a72266d66689621c1c438f71e214c2141a6416b667f9c5e556bbc2e7b3` |
| `licences/fraunces-OFL.txt` | Copyright 2018 The Fraunces Project Authors | 4391 | `bdf4c22802eaf804f998195871c6b8938aac2ac14b2d78a8bd66a6f1eced833b` |
| `licences/playfair-display-OFL.txt` | Copyright 2005–2023 The Playfair Project Authors | 4488 | `da1bf076a8c4166d6e6cde049073d872fb96b84403403c9f5c7f0134d0b45bd2` |
| `licences/lora-OFL.txt` | Copyright 2011 The Lora Project Authors, Reserved Font Name "Lora" | 4423 | `1d9a970809ac804b582a6ce7f0ebc4e7fefcbfd7ff6299cad35ee656a21be716` |

Tajawal's copyright line names Boutros International, the foundry that
designed Tajawal, and the font's name table names Tajawal. That file
licenses this family.

## Almarai, dropped

`https://github.com/googlefonts/Almarai` at `7307ede5d42bcb5b9f905736a7c6eb04347afa3b` ships an `OFL.txt` that is the SIL Open Font License 1.1, and its copyright line is "Copyright 2018 Boutros International". The word Almarai does not appear in that file. The font's name table says "Copyright (c) 2019 by Almarai. All rights reserved." and carries no licence description. The shipped licence file does not license this font, so the family was not shipped.
