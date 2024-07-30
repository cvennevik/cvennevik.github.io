---
title: "Slay the Spire #0: Preamble"
date: 2024-07-29T12:05:00+02:00
---

I want to make a Slay the Spire solver again.

---

For the uninitiated: Slay the Spire is a video game where you fight your way through floor after floor of enemies until you face the Heart of the Spire. To get there, you have to defeat the enemies in turn-based battles by playing cards from your deck, of which there are dozens and dozens of different kinds - ones that hurt the enemy, ones that protect you, ones that power you up or weaken the enemy, and so on. At any point in a run, if you run out of health, you die and the run is over.

If you want to understand the game better and have a bit more context for what I'll be working with here, I suggest watching somebody playing a full run of the game - my favorite Slay the Spire streamers are [Baalorlord](http://www.youtube.com/@Baalorlord) and [Jorbs](http://www.youtube.com/@Jorbs). [Here's a video of Baalorlord playing a run with the Ironclad that I quite like](https://youtu.be/vYkxc7eknWk).

If you would rather not spend time on that, but still want to see how I write a solver for the game, that’s fine too! I will have to implement each and every one of the mechanics of the game as I go, so it should be possible to follow along without too much prior knowledge.

---

Back in 2022, I started a side project, just for fun, to write a program that would find the best possible moves to take in Slay the Spire. It was a C# project, I spent… a couple of months on it, I think? I got it to the point where it could simulate one of the first combat encounters of the game and pick reasonably good moves. It was a lot of fun to make.

Now, in 2024, I want to do it again, but different. I'm really interested in web development at this time, and I'm planning to write it as a single web page, using plain HTML, CSS, and lots of JavaScript.

Why? I want to place more emphasis on the UI and visualization, which is easier for me out-of-the-box with a web app. It is easier for people following along to check out the code themselves, play around with it, and maybe hack it a bit themselves - you only need your web browser. It's good practice for my web development job. And I get to publish it on my site.

There are several good reasons for me not to build it as a web app, the main one for me being that JavaScript gives poor performance for the kind of search algorithms I’ll be implementing, and performance is quickly going to become a bottleneck for the problems I'm looking to solve. I'm choosing to accept this - combinatorial explosion will cause me issues at some point no matter how much power and efficiency I throw at the problem, and I do not mind it coming to bite me slightly sooner. Learning more about JavaScript performance and optimization sounds fun, anyway!

Oh, and maybe the biggest reason for doing it this way: I figured out how to write HTML on my phone, so I can get this project started now, while I'm on holiday, away from my computer. 🙂

---

I want to thank Ron Jeffries for inspiring me to write this. He’s written some lovely and entertaining series of blog posts of his own coding projects, and is currently writing a Sudoku solver ([first post here](https://ronjeffries.com/articles/-x024/-z00/0/)). It looked fun enough that I was reminded of my old solver and wanted to do something similar myself.

I could get into what my goals with this are, what I am prioritizing, what I am deprioritizing, what to expect - but I'm growing tired of writing preamble. I'd rather my next bit of writing to actually get into it. We can figure all that big-picture stuff out as we go.

Onwards!
