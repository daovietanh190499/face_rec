![image-1KGA8WW2.jpg](Lenticular_Imaging__Theory_and_Practice/image-1KGA8WW2.jpg)

Lenticular Imaging

Theory and Applications

A hundred years anniversary

Yitzhak Weissman

© 2017 Yitzhak Weissman

All rights reserved. No parts of this publication may be reproduced, stored in a retrieval system, or transmitted, in any form or by any means, electronic, mechanical, photocopying, recording or otherwise, except as permitted by Copyright Act of 1976 (US), and for the use of brief quotations in a book review or a reference, without the prior permission of the author.

The content of this book is the result of the author’s research and thoughts. Every effort has been made to validate its correctness and accuracy. However, reliance on the book content is the sole responsibility of the reader.

Published by Pop3DArt

An imprint of

![image-L2AL72IN.jpg](Lenticular_Imaging__Theory_and_Practice/image-L2AL72IN.jpg)

P.O.B 12767, Herzliya 4673324, Israel

Email: info@pop3dart.com

Web: www.pop3dart.com

Book web-page: www.pop3dart.com/lenticular-imaging

Revision 1.02, January 2018

Editions

Dedication

This book is dedicated to the pioneers of lenticular imaging, who, with genius and devotion started all this a hundred years ago.

Preface

One day, about two years ago, I woke up sweating with a pain in my chest. Panicking, I reached out for the home ECG recorder and attached its electrodes to my trembling body. A moment later, the signal was transmitted to my doctor.

It turned out to be a false alarm: my heart was healthy and sound. But when I went to my office later, the first thing I did was to write down an inventory of knowledge which resided in my head without any documentation. Staring at the list, I realized the sheer size of my research into lenticular imaging over the past five years. With a fresh memory of the morning’s incident in my mind, I decided to write this book.

When I started the project, I knew that additional research would be necessary, but I surmised that this would be limited to filling up a few gaps. Well, I was wrong. As the work progressed, the “gaps” widened and unveiled wide fields of the unknown. At times, I felt like an explorer traveling in an unchartered land abundant with hidden treasures. Extensive research interleaved with the writing took two years to complete.

The work on my earlier book (“Optical Network Theory”) during the fateful 90/91 winter was interrupted repeatedly by ballistic missile raids. Fortunately, in the past two years fortune favored me. Nothing tragic or dramatic happened in my personal life, and the most exciting event was the birth of my beloved grandson Aviv a year ago. I could work and complete the book with a peaceful mind.

Finally, I have allowed myself to add a personal touch by including a citation following every chapter title. These citations are not related to the content of their corresponding chapters; but they reflect ideas which inspired me in recent years. They serve as a light diversion form the strict scientific text, and, maybe, they will inspire you too.

Yitzhak Weissman

Herzliya, Israel, August 2017

Acknowledgements and credits

In writing the manuscript, I had the great privilege of obtaining generous help from several outstanding individuals. Stephen Palmer, Barry Johnson, Gary Jacobsen and Tomer Czyzewski reviewed early versions of some chapters and provided valuable feedback. Michal Husak and Paul Bourke reviewed the first version of the complete manuscript. Paul’s enlightening comments caused a major revision, and thanks to him the manuscript is much improved.

The manuscript was written, designed and formatted in Microsoft Word 2016. I found its fancy equation editor unusable, so I used Microsoft Equation 3 instead to enter the mathematical expressions. Most figures were done with Visio 2013. Others were made with Photoshop and DAZ Studio. The optical resolution study was done with Matlab.

Lisa (“WordDoctor” from Servicescape) proofread an early version of the manuscript meticulously, corrected all typo and grammar mistakes, and polished my style. I used Grammarly to proofread the final text.

Anna Castle is not only an accomplished mystery book author, but also a skillful Adobe Acrobat expert. Her script (Castle, 2015), made generously available to the public, saved me a lot of time and agony in converting the manuscript to a file suitable for submission to print.

Contents

Title page

Copyright and reference

Dedication

Preface

Acknowledgements and credits

CHAPTER 1 INTRODUCTION

1.1 About this book

1.2 History and background

1.3 The grids of lenticular imaging

1.4 Overview

CHAPTER 2 BASIC OPTICS OF LENTICULES AND LENTICULAR SHEETS

2.1 Cylindrical lens geometry

2.2 Fundamental optical characteristics

2.3 Basic concepts for the description of lenticule optics

2.4 The visible zone of a lenticule

2.5 The visible zone of a lenticular sheet: the optical grid

2.6 Optical imaging with an observer at the image plane

2.7 Viewing geometry of a lenticular picture

2.8 The effect of a lenticular sheet

2.8.1 Imaging line display

2.8.2 General observation line display

2.8.3 The apparent pixels

CHAPTER 3 DIGITAL IMAGES, PICTURES, AND TRANSFORMATIONS

3.1 Images and pictures

3.2 Continuous and raster images

3.3 Conversion of a continuous image to a raster image

3.3.1 General

3.3.2 Pixelization

3.3.3 Sampling

3.4 Grid images

3.5 Cellular images

3.6 Examples of the rasterization blur

3.7 Conversion of a raster image to a continuous image

3.8 Geometrical transformations on continuous images

3.9 Projective transformations

3.10 Raster image transformations

CHAPTER 4 THE INTERLACED IMAGE

4.1 Geometry

4.2 The interlacing algorithm

4.3 Printing the interlaced image

4.3.1 Choosing the horizontal printing density

4.3.2 Matching the printed and the optical grids

4.4 The mechanism of the lenticular picture

4.5 The pixel count of the interlaced image

4.6 Printing with reduced rasterization blur

4.7 Periodically matched pixel grids

CHAPTER 5 CALIBRATION

5.1 The accuracy requirement

5.2 The calibration pattern

5.2.1 General

5.2.2 The calibration band image

5.2.3 The calibration pattern image

5.3 Printing the calibration pattern image

5.4 Measuring the optical grid pitch

5.5 The number of matched bands

5.6 The measurement accuracy

5.7 Choosing the calibration pattern parameters

5.7.1 The central band cell width

5.7.2 Choice of the number of matched bands

5.7.3 Choice of the cell size increment

5.7.4 Number of bands

5.7.5 The Q parameter

5.7.6 Example

5.8 Using an interlacing algorithm to create the central band

5.9 The lenticular pitch

5.10 The continuous calibration pattern

5.10.1 General

5.10.2 Graphical construction

5.10.3 The continuous calibration pattern analytics

5.10.4 The continuous calibration pattern picture

5.11 An example of calibration using the continuous pattern

CHAPTER 6 DEPTH IMAGING IN A 3D LENTICULAR PICTURE

6.1 Real and imaged objects

6.2 The main viewing interval

6.3 Depth imaging with a 3D lenticular picture

6.4 The relation between imaged object position and its parallax

6.5 Continuous lenticular pictures

6.6 The number of resolvable images

6.7 The imaging boxes

6.8 The onset of discretization

6.9 Adjusting an object for display in a 3D lenticular picture

6.10 The depth enhancement factor

6.11 3D imaging design

6.12 The effect of rasterization blur

6.13 Depth display design practice

6.14 Validity of the small parallax approximation

CHAPTER 7 ELECTRONIC LENTICULAR DISPLAYS

7.1 Introduction

7.2 Slanted displays

7.3 Optical effects of a slanted lenticule

7.3.1 The effect of a slanted lenticule on a line

7.3.2 Apparent pixels in slanted displays

7.4 Pixel structure in slanted electronic displays

7.5 The slanted interlaced image

7.6 Displaying the slanted interlaced image

7.7 Depth imaging in slanted displays

7.8 The number of resolvable images in slanted displays

7.9 Characteristics of TV displays

CHAPTER 8 THE VIEWING SPACE OF 3D LENTICULAR PICTURES

8.1 The break line

8.2 Viewing considerations of 3D lenticular pictures

8.3 The normals of a lenticular picture

8.4 Qualitative geometry of the proper viewing zones

8.5 Coordinate systems for the interlaced picture

8.6 Quantitative analysis of lobes geometry: the main lobe of a perfectly centered picture

8.6.1 The content displayed by a lenticule

8.6.2 The formation of a break line

8.6.3 The optical grid displacement constraints for a centered picture

8.6.4 Relation between displacements

8.6.5 The main lobe for a centered picture

8.7 Off-center lobes

8.7.1 General

8.7.2 The non-centered main lobe

8.7.3 Secondary lobes in a centered picture

8.7.4 Secondary lobes in non-centered picture

8.8 The effect of binocular vision

8.9 Depth display for general viewing distances

8.9.1 General

8.9.2 The effect of transition lines in the visual parallax

8.9.3 Depth display in the absence of interfering lines

8.9.4 Depth display in the presence of interfering lines

8.10 The effect of grids misalignment

8.11 Dynamic pictures

8.12 The lenticular picture as a stereoscopic viewer

8.13 Other mechanisms which affect the viewing regions

8.13.1 Resolution

8.13.2 Distortions

8.13.3 Slanting

CHAPTER 9 CONTENT PREPARATION FOR A 3D LENTICULAR PICTURE

9.1 3D lenticular photography

9.2 The ortho-3D scenarios

9.2.1 The viewing scenario

9.2.2 The ortho-3D photography scenario

9.2.3 Scaled ortho-3D photography scenario

9.3 Deviations from ortho-3D photography

9.3.1 Shooting distance

9.3.2 Controlling the imaged depth

9.4 Parallel 3D lenticular photography

9.5 Converged 3D photography

9.6 Correction of the keystone distortion

9.6.1 The rotated 3D window

9.6.2 Computation of the rotated window corners coordinates

9.6.3 Application of the automatic correction: an example

9.7 Real photography example

9.7.1 Introduction

9.7.2 Initial cropping

9.7.3 Creation of the reference window rectangle

9.7.4 Registration

9.7.5 Final cropping

9.8 Photography and depth design

9.9 Adjustment of the 3D window plane position

9.10 Increasing the continuous depth display

9.10.1 General

9.10.2 Over-resolved printing

9.10.3 Blur emulation

9.10.4 Intracell and intercell blurring

9.10.5 Sequence processing

CHAPTER 10 DIGITAL PRINT

10.1 Printer characteristics for the lenticular application

10.2 Printer resolution

10.3 Printer resolutions in other printing technologies

10.4 Printer regularity

CHAPTER 11 OPTICAL RESOLUTION ANALYSIS

11.1 Mechanisms affecting optical resolution

11.2 Ray tracing methodology

11.3 Ray tracing in the imaging plane

11.3.1 Ray tracing analytics in the imaging plane

11.3.2 Imaging rays bundles

11.3.3 The center and the boundaries of the visible zone

11.3.4 The significance of the acceptance angle interval

11.3.5 Optical characteristics in the imaging plane

11.4 Three-dimensional ray tracing analysis

11.4.1 Coordinate system and angles for three-dimensional ray tracing

11.4.2 Ray tracing algorithm

11.4.3 The three-dimensional rays bundle

11.4.4 Backplane point distributions for a zero horizontal viewing angle

11.4.5 Optical resolution as a function of the vertical angle for a zero horizontal angle

11.4.6 Optical resolution in the angle plane

11.5 Other mechanisms which affect the optical resolution

11.5.1 Introduction

11.5.2 Deviation from focus

11.5.3 Finite size of the viewer’s pupil

11.5.4 Chromatic aberrations

11.6 Mapping of lenticule optical data to a sheet

11.7 Discussion

APPENDIX: MAIN QUANTITIES AND DEFINITIONS

INDEX

BIBLIOGRAPHY

Chapter 1

Introduction

“For there was a moment when anything was possible. And there will be a moment when nothing is possible. But in between we can create.”

- Moshin Hamid, in “How to Get Filthy Rich in Rising Asia”

![image-7CVWSNS8.jpg](Lenticular_Imaging__Theory_and_Practice/image-7CVWSNS8.jpg)

1.1 About this book

This book is intended for students, scientists, and engineers wishing to learn about lenticular imaging or to expand and diversify their knowledge about 3D display systems in general. It will also be useful to practitioners of lenticular print technology, 3D photographers, and graphical artists who wish to understand and explore the lenticular medium for imaging.

The book treats phenomena and theory related to lenticular imaging with backplane pictures, giving the reader a solid background on which they can base their exploration or development. The priority in the book is to explain the theoretical principles, and in most cases, detailed examples supplement the academic discussion. Nevertheless, this book is not a practical guide for the fabrication of lenticular pictures.

There are two main types of lenticular pictures: 3D and dynamic. A 3D picture displays a three-dimensional scene by invoking stereopsis (Stereopsis, 2017). Dynamic pictures display different and generally independent images for different viewing angles. Formally, 3D pictures are a particular case of dynamic pictures, but they will be regarded in this book as a separate category, adopting the terminology in the art. The focus in this book is on 3D pictures, but the discussion of general dynamic pictures is also included.

This book exhibits original and hitherto unpublished research. The disciplines involved are optics, image processing, printing technology, computer graphics, and photography. Basic background in these disciplines will be helpful for the reading. The mathematical treatment is with varying degree of complexity, but only college-level mathematical tools are used.

1.2 History and background

The first technique that allowed freely-viewed 3D pictures to be made was the “parallax barrier” (Parallax barrier, 2017), and is over 100 years old. It was independently invented by Berthier (Berthier, 1896) and Ives (Ives, 1902), and was later patented by Ives (US Patent No. 725,567, 1903).

The parallax barrier method is based on obscuration, and as such, it suffers from low optical efficiency. Besides, the displayed image includes the grid of the obscuring elements. The lenticular method, which is based on refraction, is free from these shortcomings. Despite this, the parallax barrier method is popular in stereoscopic electronic displays, because it allows easy electronic switching between 2D and 3D modes.

Lenticular imaging is a one-dimensional implementation of the integral imaging concept (Lippman, 1908). In contrast to true integral imaging that uses a dense array of plano-convex round lenses and can display a change of perspective in both the horizontal and the vertical directions, lenticular imaging uses an array of plano-convex cylindrical lenses instead. With such an array, it is possible to show the changing perspective in one direction only, but this is sufficient to create an impressive 3D effect.

The first description of a 3D lenticular picture is due to Hess (US Patent No. 1,128,979, 1915), who proposed using a lenticular sheet to create a stereoscopic picture. Kanolt generalized this idea and showed how to make a multi-view lenticular picture (US Patent No. 1,260,682, 1918). Kanolt’s scheme forms the basis for modern lenticular imaging.

The development of lenticular imaging started in the late 1920s by Herbert Ives and Harvey Prever in the US and a few other scientists (Vance, 2000). Soon after that, the unique imaging capabilities of a lenticular sheets were established, and researchers in Britain, France, and Germany developed processes to manufacture such sheets.

In the early 1940’s Bonnet in France and Winnek in the US developed photographic processes and cameras to record images suitable for 3D lenticular imaging. Bonnet opened a studio on the Champs-Elysees (Paris, 1942), which included a 3D lenticular photography service.

The development of mass-production techniques for lenticular sheets in the early 1960s made lenticular imaging available to advertising and publishing markets. Look magazine published the first mass-produced color lenticular picture in 1964, using a process developed by Kodak. Over 8 million copies were sold.

Early methods for image deposition on a lenticular sheet were based on photography, as proposed originally by Kanolt (US Patent No. 1,260,682, 1918). For such use, the lens sheet was coated with a photographic emulsion. Starting in the 1980's, rapid developments in the print industry shifted the interest to image deposition using lithographic printing. This development brought significant cost reduction, and the use of lenticular pictures, both dynamic and 3D, became prolific in advertising, packaging, and novelty item industries.

Lithographic printing is cost-effective only at high volume, typically at several thousands of units, and is unsuitable for a thick lenticular sheet. The advent of high-resolution digital printing and digital image processing beginning around 1990, allowed the creation of a single lenticular picture at an affordable price and any sheet thickness. This price drop opened the possibility of making single pictures for personal use and art at a reasonable cost.

Concerning scientific research, lenticular imaging stayed in darkness for many decades. Perhaps the last and the only significant academic study of lenticular imaging is from 1976 (Okoshi, 1976). This has changed in the past 20 years, during which considerable efforts had been invested in the development of electronic lenticular displays. In such systems, an LCD is used to create the backplane picture, and therefore they can display a 3D video which can be watched without any visual aids. This technology attracted much attention from commercial display companies, in the hope of using it for consumer TV sets. The business activity spurred scholarly research (Leuder, 2012) (Byoungho, Soon-gi, Keehoon, & Jisoo, 2016), which also included some aspects of lenticular imaging. Although electronic and printed lenticular pictures share a few essential elements, they also differ in several important aspects, the most important being their pixel structure. The particular pixel structure of LCD displays requires slanting of the lenticular sheet.

A special chapter in this book is devoted to electronic lenticular displays which use slanted lenticular sheets. To simplify the exposition, in all other chapters the theory is presented for the simpler case of non-slanted (“erect”) pictures, and the backplane picture is assumed to be printed. This special chapter outlines the application of non-slanted displays theory to slanted displays. However, the rigorous treatment of imaging in slanted displays requires further research.

1.3 The grids of lenticular imaging

The lenticular picture is composed of two basic elements: the lenticular sheet and the backplane picture. Each one of these elements is characterized by one or more grids. The primary technical challenge in the fabrication of the lenticular picture is the management, adjustment, and alignment of these grids.

In modern lenticular imaging, the backplane picture is prepared by image processing and printing. In such a workflow, there are three main grids:

1 . The lenticular array grid,

2 . The optical grid,

3 . The printed grid.

Each one of these grids has a characteristic pitch. These quantities are frequently mentioned throughout the book and are denoted by the same symbols in the different chapters.

Table 1 : The three main grids of the lenticular picture

The optical grid is manifested by an array of bright lines which appear at the lenticular sheet backplane when illuminated from the front by a point light source. In the optical sense, these lines are the images of the light source as created by the lenticules of the lenticular sheet. The position of this grid depends on the location of the light source, and its pitch depends on the distance of the light source from the lenticular sheet. When the light source is turned off, the optical grid disappears. Throughout this book, the optical grid is an imaginary grid, which would have appeared if a point light source was positioned in the center of the observer's eye pupil. By contrast, both the printed and the lenticular grids are physical and permanent entities.

The lenticular and the printed grid pitches are entirely determined by the lenticular sheet and the printing process respectively. The optical grid pitch is determined by the lenticular sheet characteristics and the viewing distance. In the early lenticular pictures, the backplane picture was created photographically and was a developed photographic emulsion. In this method, the "printed" and the optical grids pitches coincide.

The primary task in the printing process is matching the optical and the printed grids for a given viewing distance. The main task in the picture fabrication is the alignment of the printed and the optical grids so that they are centered and parallel to each other.

Digital technology has revolutionized all industries, by boosting performance and dropping prices. However, this technique requires quantization of the relevant physical quantities so that they can be represented by numbers with a limited number of bits. In the context of digital imaging, the quantization requirement gave rise to the pixel grid. This is an additional grid which is present in lenticular imaging. Even though this grid was not included in the list of fundamental grids, its existence has an important impact on lenticular pictures, particularly in cases in which its pitch nearly matches the printed pitch. The issues related to the pixel grid are discussed in paragraph 3.4 .

Finally, there is yet another grid which affects lenticular pictures, and which is purely a printing technology feature. This grid is called “screen” and is used for the creation of color gradients from discrete dots (Halftone, 2017). The existence of this grid limits the pixel densities used to print the backplane image to a series of values called “preferred densities." This fact is discussed and illustrated in paragraph 10.4 .

1.4 Overview

The chapters of this book are arranged in a logical order. Namely, each chapter depends on concepts introduced and discussed in the previous ones. However, with little imagination and intuition, they can be read independently. All chapters rely on the grid concepts, and therefore the reader should understand their significance as explained in the earlier paragraph, before trying to learn a chosen chapter independently. It is also recommended for all readers to read Chapter 2 before attempting to read another chapter independently.

There are four main tasks in making a lenticular picture:

1 . Content preparation,

2 . Calibration,

3 . Interlacing,

4 . Fabrication.

Fortunately, these tasks are to a large extent independent, and each can be accomplished by different personnel. Usually, the first step is carried out by a graphics artist, and the rest by the printing studio operators.

The outcome of the content preparation is a sequence of images, called a “lenticular sequence.” These images are multiplexed into a single “interlaced” image. The interlaced image is printed and (if not printed directly on) bonded to the lenticular sheet. Calibration is necessary for the printing. All principles upon which these tasks are based are described in this book. Other topics presented in the book are related to the visual characteristics and performance of lenticular pictures.

The basis for understanding the lenticular picture mechanism is the optics of the lenticular sheet. This topic is the subject of Chapter 2 . Many concepts introduced in this chapter are borrowed from the discipline of classical imaging optics, but many others are unique to cylindrical lens and lenticular sheets. These ideas are used in many instances throughout the book.

Chapter 3 includes several topics related to image processing, which are necessary for the discussion in subsequent chapters. Most of the issues are well known in the image processing discipline and are reproduced here for the convenience of the reader. There are others which are less familiar, like the matched pixel grid. This concept is important for the understanding of the visual characteristics of lenticular pictures.

The interlacing process is discussed in detail in Chapter 4 . This discussion is perhaps the most abstract exposition in the book. The general interlacing algorithm may be implemented in many variations, the study of which is full of intricate technical details. This study is not included in the present book.

Calibration is the measurement of the optical grid pitch. This measurement must be done with a high accuracy, typically with a relative tolerance of the order of 10 -4 . Variations on this scale exist in the manufacturing of a lenticular sheet, as well as between different rulers (like the ruler of the lenticular sheet extrusion machine and the printer of the printing studio). Therefore, it is necessary to perform the measurement in the printing studio, preferably for each lenticular sheet. This process is the subject of Chapter 5 .

Practitioners working with the 3D lenticular medium know that objects imaged near the picture plane are displayed with a high visual quality. As the distance between an imaged object and the picture plane increases, its display starts to acquire visual defects, and its visual quality deteriorates. As the most valuable visual asset of a 3D lenticular picture is the display of depth, artists strive to display as much depth as possible. Consequently, practitioners often choose to allow defects with a certain magnitude to increase the displayed depth. Quite often, the optimal compromise between depth display and visual quality is achieved by an expensive and time-consuming iterative process of try and correct.

The matter is complicated by the fact that there are two different mechanisms, each one responsible for a different visual defect. It is possible to trade one defect for the other, but not to reduce both simultaneously. In Chapter 6 it is explained how to control the compromise between depth display and visual defects to optimize the picture display without the need to perform expensive try-and-correct experiments.

Chapter 7 is a review of electronic lenticular displays. The main differences between printed and electronic lenticular displays are discussed, and the methods which are used to create electronic displays are outlined, using the concepts of printed pictures.

Readers who have experience viewing 3D lenticular pictures know that there are viewing regions in which the picture looks crisp and clear and regions in which the picture exhibits blurriness and even noticeable visual defects. Understanding this phenomenon is essential for the picture design, and this is the topic of Chapter 8 .

There are two methods to create a lenticular sequence for a 3D picture: synthetic and photographic. In the synthetic method, the sequence is created from a set of two-dimensional images using various algorithms. A typical procedure is to use several images disposed on layers with different depths. The layers can be further sculptured using depth maps (Depth map, 2017). In Chapter 9 , the photographic method is discussed in detail. The discussion applies to both real and virtual photography, which is used for scenes generated by a 3D software program. This chapter is illustrated with numerous examples, and is closer to be a practical guide than the other chapters.

The characteristics of lenticular pictures depend heavily on the characteristics of the printing process. Some aspects of the digital print which are relevant to lenticular imaging are discussed in Chapter 10 . However, this subject requires further research.

Chapter 11 is devoted to the analysis of the optical resolution and distortion of a lenticular sheet. These mechanisms set the most fundamental limit on the performance of lenticular images. For digitally printed and electronic pictures, the bottleneck is the picture resolution. Higher-resolution printing processes may compete with the optical resolution. The optical resolution analysis explains a few phenomena, for instance, the blurriness that appears when viewing the picture at high horizontal angles.

Chapter 2

Basic optics of lenticules and lenticular sheets

“Not only could he simplify complex matters, he could also keep simple matters simple.”

- David McCullough, in “Truman”

![image-CWTNRKT0.jpg](Lenticular_Imaging__Theory_and_Practice/image-CWTNRKT0.jpg)

2.1 Cylindrical lens geometry

A lenticular sheet is an array of identical lenticules. Each lenticule is an optical element known as “cylindrical lens," of the type called "plano-convex."

The geometry of a general plano-convex cylindrical lens is shown in Figure 1 . It may be regarded as a union of two parts: a relatively thin cylindrical section and a solid cuboid. The cylindrical section is responsible for the imaging function of the lens. The lens geometry is characterized by its dimensions and the radius of the parent cylinder. This radius is also called the “radius of curvature” of the lens.

The parent cylinder axis will be referred to as the lens axis. Unlike the axis of circular plano-convex lenses, customarily defined as orthogonal to its planar face, this axis is parallel to the lens backplane.

![image-2TOSJ0J6.jpg](Lenticular_Imaging__Theory_and_Practice/image-2TOSJ0J6.jpg)

Figure 1 : Plano-convex cylindrical lens geometry.

2.2 Fundamental optical characteristics

Let us consider a cross-section perpendicular to the lens axis shown in Figure 2 . The curved surface in this cross-section is a circular arc. Such an element is known to exhibit optical imaging. This means that all rays (in this plane) emerging from a point O in front of the curved surface will approximately converge to a point F behind it. This is illustrated in Figure 2 where three distances were introduced: s’ , s , and f . These distances denote the source and the convergence point distances from the curved surface ( s’ and s respectively) and the associated focal length ( f ). The fourth distance t in Figure 2 denotes the lens thickness.

![image-1D3ERVS0.jpg](Lenticular_Imaging__Theory_and_Practice/image-1D3ERVS0.jpg)

Figure 2 : Fundamental optical characteristics of a lenticule.

The distances s ’, s , and f are related by the known “lens maker’s formula” (Jenkins & White, 1957):

![image-GH1HYK4X.jpg](Lenticular_Imaging__Theory_and_Practice/image-GH1HYK4X.jpg)

where n is the lens material index of refraction. The plane located at distance f behind the curved surface is called the “focal plane," and its footprint is shown in Figure 2 . Rays emerging from infinity will converge to points on this plane, as can be derived from Equation 1 by letting s’ increase to infinity.

The focal length f is related to the lens radius r by (Jenkins & White, 1957):

![image-6RGW81V1.jpg](Lenticular_Imaging__Theory_and_Practice/image-6RGW81V1.jpg)

Lenticules are designed so that their backplane coincides with their focal plane, or, in other words, t = f . Substituting t for f in Equation 2 results in

![image-BHWF2J7W.jpg](Lenticular_Imaging__Theory_and_Practice/image-BHWF2J7W.jpg)

or

![image-75ZNBCZM.jpg](Lenticular_Imaging__Theory_and_Practice/image-75ZNBCZM.jpg)

In general, the parameters t , r , and p are independent. The requirement that the focal plane will coincide with the backplane of the lens reduces the number of free parameters that define a lenticule to just two. The geometry of a lenticule with the focal plane at the backplane is shown in Figure 3 .

![image-2B2905VK.jpg](Lenticular_Imaging__Theory_and_Practice/image-2B2905VK.jpg)

Figure 3 : The geometry of a lenticule.

Transparent optical polymers are used to manufacture lenticular sheets. The indices of refraction of such materials typically vary between 1.49 to 1.6. Some values are given in Table 2 . In all calculations presented in this book, it will be assumed that the value of n is 1.6.

Table 2 : Indices of refraction of optically transparent polymers used for lenticular lenses.

In the theory of optical imaging lenses, there is an important parameter called "relative aperture" (also known as "f-number," "focal ratio," "f-stop," etc.). This parameter is the ratio between the lens' focal length f and the diameter D of its entrance pupil (Jenkins & White, 1957):

![image-M2RWXZY8.jpg](Lenticular_Imaging__Theory_and_Practice/image-M2RWXZY8.jpg)

For lenticules, a similar parameter is introduced: relative pitch. It will be denoted by R p and defined as

![image-IK7ATYQ7.jpg](Lenticular_Imaging__Theory_and_Practice/image-IK7ATYQ7.jpg)

Since in lenticules the thickness t is the same as the focal length f , and p plays the role of the aperture size, R a is related to the inverse of R p . In the present treatment, the definition in Equation 6 is more convenient than the traditional definition used for R a .

There are two primary applications of lenticular pictures: 3D and dynamic. The value of R p in lenticules used for 3D applications is in the range 0.4 to 0.6. In dynamic pictures, values of R p between 1 and 1.3 are typically used.

Figure 3 shows three angles which play an essential role in lenticule optics: the lenticule viewing angle α , the lenticule acceptance angle β , and the lenticule vignetting angle γ .

The viewing angle is defined as the angle subtended by the backplane with respect to the lenticule axis, as shown in Figure 3 . It is seen that

![image-M25JWDEA.jpg](Lenticular_Imaging__Theory_and_Practice/image-M25JWDEA.jpg)

For small lenticule viewing angles, one can approximate (in radians)

![image-UXIVWNDY.jpg](Lenticular_Imaging__Theory_and_Practice/image-UXIVWNDY.jpg)

The lenticule acceptance angle is given by

![image-U2JIJO19.jpg](Lenticular_Imaging__Theory_and_Practice/image-U2JIJO19.jpg)

For small lenticule acceptance angles one can approximate (in radians)

![image-JQ9G09UH.jpg](Lenticular_Imaging__Theory_and_Practice/image-JQ9G09UH.jpg)

For values of n shown in Table 2 , the angle β is larger than α . Both the viewing and the acceptance angles characterize the imaging properties of the lenticule and the lenticular sheet.

The vignetting angle γ is the angle between the two tangents to the lenticules surfaces at the crevice between them. It affects viewing at a large angle, as illustrated in Figure 4 . When the lenticular sheet is observed from an angle which exceeds γ /2, the crevice line between adjacent lenticules becomes obscured, and the observer will not be able to see their full aperture.

![image-7ORS361C.jpg](Lenticular_Imaging__Theory_and_Practice/image-7ORS361C.jpg)

Figure 4 : Obscuration caused by viewing beyond the vignetting angle.

Since the tangent to a circle is orthogonal to its corresponding radius vector, it can be deduced (with the help of Figure 3 ) that (in radians)

![image-3M840MBC.jpg](Lenticular_Imaging__Theory_and_Practice/image-3M840MBC.jpg)

Thus, the vignetting angle is smaller for lenticules with a higher value of R p .

Table 3 shows values of the various quantities discussed here in lenticules used by commercial manufacturers. In the first two columns, the most common specifications of lenticular sheets were entered: the thickness t and the lenticule density ρ , which is the number of lenticules per unit length. It is common to use an inch as the unit of length for density, in which case the density unit is called “lpi," standing for "lenticules per inch." The lenticule pitch p can be derived from the density by the relation

![image-PMEPBTLK.jpg](Lenticular_Imaging__Theory_and_Practice/image-PMEPBTLK.jpg)

The values in the t , p , and r columns are in units of mm. The values in the lenticule density column are in units of 1/inch. All angular values are in degrees. The first two columns (shown in bold types) were specified, and all other columns were calculated with n = 1.6.

Table 3 : Characteristics of some common lenticular sheets

2.3 Basic concepts for the description of lenticule optics

Two families of planes are of interest in relation to the lenticule geometry:

