// =====================================================================
// Root Cause Detective -- case files
//
// Each case is plain data: a briefing, and locations full of actions.
// An action shows some text, may add a clue to the player's notebook,
// and costs "minutes" of the investigation clock.
// The game engine (game.js) knows nothing about any specific case, so you
// can add new cases here without touching the engine.
// =====================================================================

const CASES = [
  {
    id: "burr-lot",
    title: "Case #1: The Burr Lot",
    tagline: "40 brackets rejected for burrs. The plant manager wants a name.",
    minutes: 240,        // time to investigate: 4 hours. Not enough to do everything.
    briefing: `
      <p><b>Customer:</b> an aerospace OEM &nbsp;·&nbsp; <b>Part:</b> mounting bracket BRK-220, Rev C
      &nbsp;·&nbsp; <b>Lot:</b> 2210 (40 pcs)</p>
      <p>The customer's receiving inspection rejected the entire lot. All four mounting
      holes on every bracket have <b>raised burrs</b> on the exit side. The customer wants a
      root cause and corrective action, and your plant manager wants to know
      "who messed up."</p>
      <p>The last 30 lots of this part shipped clean.</p>
      <p class="assignment">Find out <b>why the burrs happened</b> (the occurrence root cause)
      and <b>why your inspection didn't catch them</b> (the escape point).</p>`,

    locations: [
      {
        id: "office",
        name: "Quality Office",
        icon: "📋",
        description: "Your desk. The customer's rejection report is on top of the pile.",
        actions: [
          {
            id: "complaint",
            minutes: 10,
            label: "Read the customer's rejection report",
            text: `Rejection report, lot 2210: "Burrs up to 0.4 mm high on the exit side of all
              four Ø6.5 holes, 40 of 40 parts. Burrs interfere with fastener seating." Photos
              show sharp, ragged lips around every hole. Clean entry side.`,
            clue: { id: "c-complaint", fits: ["Symptom"], title: "Every part, every hole",
                    text: "40/40 parts, all 4 holes, exit side only. Something systematic, not random." },
          },
          {
            id: "history",
            minutes: 20,
            label: "Check this part's shipping history",
            text: `The quality database shows 30 straight lots of BRK-220 shipped with zero
              complaints. Lot 2210 is the first lot built at <b>Rev C</b>. All earlier lots
              were Rev B.`,
            clue: { id: "c-revc", fits: ["Method"], title: "First lot at Rev C",
                    text: "Lot 2210 is the first lot built to Rev C. 30 clean lots before it, all Rev B." },
          },
        ],
      },
      {
        id: "floor",
        name: "Shop Floor",
        icon: "🏭",
        description: "The CNC cell where BRK-220 is drilled. Two shifts run this cell.",
        actions: [
          {
            id: "maria",
            minutes: 30,
            label: "Interview Maria (1st shift operator, 3 weeks on the job)",
            text: `Maria looks nervous. "I ran lot 2210. I followed the traveler exactly, step by
              step. My trainer told me never to skip a step or add one that isn't on the
              traveler." She shows you her training record: signed off on this cell last week.`,
            clue: { id: "c-maria", fits: ["People"], title: "Maria followed the traveler",
                    text: "New operator ran lot 2210, trained to follow the traveler exactly. Training record is current." },
          },
          {
            id: "dale",
            minutes: 30,
            label: "Interview Dale (2nd shift operator, 22 years)",
            text: `Dale shrugs. "Burrs? Not on my parts. I knock the edges off every hole on the
              deburr station before they leave the cell. Always have. Is that on the paperwork?
              Honestly, I don't look at the traveler much anymore. I know this part."`,
            clue: { id: "c-dale", fits: ["People"], title: "Dale deburrs from habit",
                    text: "Veteran operator deburrs every part out of habit, not because the traveler says to." },
          },
          {
            id: "deburr-tool",
            minutes: 30,
            label: "Inspect the deburr station",
            text: `The countersink deburr tool shows some wear on the edges, but it still cuts
              cleanly on a test coupon. Its maintenance log is up to date. It works fine when
              someone uses it.`,
            clue: { id: "c-tool-ok", fits: ["Machine"], title: "Deburr tool works",
                    text: "Some wear, but it cuts a clean test coupon. Maintenance is current." },
          },
          {
            id: "drill",
            minutes: 30,
            label: "Check the drill and its tool-life counter",
            text: `The Ø6.5 drill was changed 120 holes before lot 2210 started. Its tool life
              is 1,500 holes. The cutting edges look sharp under the loupe. A sharp drill still
              leaves an exit burr. That's what the deburr step is for.`,
            clue: { id: "c-drill-ok", fits: ["Machine"], title: "Drill is sharp",
                    text: "Well within tool life. Even sharp drills leave exit burrs; deburring removes them." },
          },
        ],
      },
      {
        id: "records",
        name: "Engineering Records",
        icon: "🗄️",
        description: "Travelers, routers, and engineering change requests live here.",
        actions: [
          {
            id: "traveler-2210",
            minutes: 20,
            label: "Pull the traveler for lot 2210 (Rev C)",
            text: `Op 10 Saw · Op 20 Mill · Op 30 Drill 4X Ø6.5 · <b>Op 50 Final inspect</b> ·
              Op 60 Pack. There is no Op 40. The operations jump straight from 30 to 50.`,
            clue: { id: "c-no-op40", fits: ["Method"], title: "Op 40 is missing on Rev C",
                    text: "The Rev C traveler goes Op 30 Drill → Op 50 Final inspect. No Op 40." },
          },
          {
            id: "traveler-2105",
            minutes: 20,
            label: "Pull the traveler for lot 2105 (Rev B)",
            text: `Op 10 Saw · Op 20 Mill · Op 30 Drill 4X Ø6.5 · <b>Op 40 Deburr all holes</b> ·
              Op 50 Final inspect · Op 60 Pack.`,
            clue: { id: "c-op40-revb", fits: ["Method"], title: "Rev B had Op 40 Deburr",
                    text: "The Rev B traveler included Op 40: Deburr all holes." },
          },
          {
            id: "ecr",
            minutes: 40,
            label: "Read ECR-0412 (the Rev B → Rev C change)",
            text: `ECR-0412 changed the hole size from Ø6.4 to Ø6.5 at the customer's request.
              Engineering updated the drawing, then <b>regenerated the router in the ERP from a
              template</b>. The ECR checklist covers the drawing, the CMM program, and the
              customer approval. There is <b>no step to review the new router against the old
              one</b>. Nobody compared them.`,
            clue: { id: "c-ecr", fits: ["Method"], title: "ECR had no router review",
                    text: "The router was regenerated from a template during ECR-0412. The ECR process has no step to compare the new router to the old one." },
          },
        ],
      },
      {
        id: "inspection",
        name: "Final Inspection",
        icon: "🔍",
        description: "Every lot of BRK-220 gets a final inspection before it ships.",
        actions: [
          {
            id: "plan",
            minutes: 20,
            label: "Review the BRK-220 inspection plan",
            text: `The plan checks hole diameter (pin gage), hole position (CMM, first and last
              piece), overall dimensions, and finish. There is <b>no check for burrs or edge
              condition</b>. The deburr step has always been trusted to handle it.`,
            clue: { id: "c-no-burr-check", fits: ["Measurement"], title: "No burr check in the inspection plan",
                    text: "Final inspection measures size and position but never looks at edge condition." },
          },
          {
            id: "inspector",
            minutes: 20,
            label: "Talk to the final inspector",
            text: `"Lot 2210 passed everything on the plan. Diameters and positions were perfect.
              I'm not supposed to judge edges on this part. Nothing on the plan about it, and
              we've never had a burr problem."`,
            clue: { id: "c-inspector", fits: ["Measurement", "People"], title: "Inspector followed the plan",
                    text: "The lot passed every check that's on the plan. Edges aren't on the plan." },
          },
        ],
      },
      {
        id: "receiving",
        name: "Receiving",
        icon: "📦",
        description: "Incoming material and certifications.",
        actions: [
          {
            id: "material",
            minutes: 30,
            label: "Check the material certs for lot 2210",
            text: `6061-T6 aluminum, same supplier and same mill as the last 30 lots. Hardness
              and chemistry are well within spec. Nothing unusual.`,
            clue: { id: "c-material-ok", fits: ["Material"], title: "Material is normal",
                    text: "Same 6061-T6 from the same mill as every clean lot. Certs in spec." },
          },
        ],
      },
    ],

    // ---------------- The accusation ----------------
    problem: "Burrs on lot 2210",

    // Occurrence: why did the burrs happen? Each option has a score (0-1),
    // feedback, and the clue ids that prove it (needed to get evidence points).
    occurrence: [
      { text: "Operator error: Maria is new and skipped the deburr step.",
        score: 0, blame: true,
        feedback: "That's blame, not a root cause. Maria followed the traveler exactly as she was trained. The traveler was wrong." },
      { text: "The deburr tool is worn out and leaves burrs.",
        score: 0,
        feedback: "Red herring. The deburr tool cuts a clean coupon. The problem is that nobody used it on lot 2210." },
      { text: "The drill was dull, which created oversized burrs.",
        score: 0,
        feedback: "Red herring. The drill was well within tool life. Even sharp drills leave exit burrs." },
      { text: "New operators aren't trained well enough.",
        score: 0.25,
        feedback: "Partly reasonable, but Maria's training was current and she did what it taught her: follow the traveler. Better training wouldn't have fixed a bad traveler." },
      { text: "Op 40 Deburr was dropped when the router was regenerated during ECR-0412, and the ECR process has no step to review the new router against the old one.",
        score: 1, needs: ["c-no-op40", "c-ecr"],
        feedback: "Exactly. A system gap: the change process allowed an operation to disappear without anyone checking." },
      { text: "The Rev C material is softer and burrs more easily.",
        score: 0,
        feedback: "Red herring. Same 6061-T6, same mill, certs in spec." },
    ],

    // Escape: why didn't your own inspection catch it?
    escape: [
      { text: "The final inspector missed the burrs.",
        score: 0, blame: true,
        feedback: "Blame again. The inspector checked everything on the plan. Burrs weren't on it." },
      { text: "The inspection plan has no check for burrs or edge condition. It relied entirely on the deburr operation.",
        score: 1, needs: ["c-no-burr-check"],
        feedback: "Correct. When Op 40 disappeared, nothing downstream was looking for its failure." },
      { text: "The final inspection sample size was too small.",
        score: 0,
        feedback: "All 40 parts were bad. Any sample would have caught it, if anyone had looked at the edges." },
      { text: "The customer's receiving inspection is too strict.",
        score: 0,
        feedback: "Burrs that stop fasteners from seating are a real defect. The customer did their job." },
    ],

    // Shown on the verdict screen: what really happened
    solution: `Lot 2210 was the first lot built to Rev C. When ECR-0412 changed the hole size,
      engineering regenerated the router in the ERP from a template, and <b>Op 40 Deburr was
      lost</b>. The ECR checklist had no step to compare the new router to the old one.
      Maria, trained to follow the traveler exactly, did just that. Dale's parts would have been
      fine because he deburrs out of habit, which had been quietly masking the gap.
      Final inspection didn't catch it because <b>the inspection plan never checked edge
      condition</b>; it had always trusted Op 40.`,
  },
  // ===================================================================
  {
    id: "mirror-image",
    title: "Case #2: The Mirror Image",
    tagline: "12 right-hand parts in a left-hand box. They look identical.",
    minutes: 210,        // 3.5 hours. Tighter than case 1.
    briefing: `
      <p><b>Customer:</b> a semiconductor equipment maker &nbsp;·&nbsp; <b>Part:</b> frame bracket
      BRK-310-L (left-hand) &nbsp;·&nbsp; <b>Lot:</b> 3305 (50 pcs)</p>
      <p>The customer's assembly line stopped when brackets wouldn't bolt up. They found that
      <b>12 of the 50 parts in the BRK-310-L box are BRK-310-R</b>: the right-hand version, a mirror
      image. The two parts look almost identical.</p>
      <p>The customer is asking for a containment plan and a root cause by end of day. Your plant
      manager has already said, "Somebody grabbed the wrong parts."</p>
      <p class="assignment">Find out <b>how the right-hand parts got into the left-hand lot</b>
      (occurrence) and <b>why nobody caught the mix before it shipped</b> (escape).</p>`,

    locations: [
      {
        id: "office2",
        name: "Quality Office",
        icon: "📋",
        description: "The customer's complaint and the production schedule are on your desk.",
        actions: [
          {
            id: "complaint2",
            minutes: 10,
            label: "Read the customer's complaint",
            text: `"Lot 3305, labeled BRK-310-L, qty 50. 12 pieces are BRK-310-R. Discovered at
              assembly when the mounting holes didn't line up. The label on the box is correct
              for BRK-310-L." The 12 wrong parts are otherwise perfect right-hand brackets.`,
            clue: { id: "c2-complaint", fits: ["Symptom"], title: "12 R parts in an L box",
                    text: "12 of 50 parts in lot 3305 are the mirror-image right-hand part. The box label is correct." },
          },
          {
            id: "schedule2",
            minutes: 20,
            label: "Check the production schedule",
            text: `Lot 3304 (BRK-310-<b>R</b>, 50 pcs) and lot 3305 (BRK-310-<b>L</b>, 50 pcs) ran on
              the same day, back to back. The right-hand lot ran first. Both lots went through the
              same CNC cell and the same finishing department.`,
            clue: { id: "c2-schedule", fits: ["Method"], title: "R ran right before L",
                    text: "The right-hand lot ran first, then the left-hand lot, same day, same cell, same finishing department." },
          },
        ],
      },
      {
        id: "cnc2",
        name: "CNC Cell",
        icon: "🏭",
        description: "Where both brackets are machined.",
        actions: [
          {
            id: "ray",
            minutes: 30,
            label: "Interview Ray (CNC operator, 15 years)",
            text: `"I ran the R lot, then the L lot. Between them I cleared the table, the chip tray,
              and the outfeed, same as always, and signed the line-clearance sheet. Every R part
              went into an R tote with an R tag. I counted 50 into each tote."`,
            clue: { id: "c2-ray", fits: ["People"], title: "Ray counted 50 into each tote",
                    text: "Ray says he cleared the cell between lots and counted 50 R and 50 L into separate, tagged totes." },
          },
          {
            id: "clearance",
            minutes: 20,
            label: "Review the CNC line-clearance checklist",
            text: `The checklist between lot 3304 and 3305 is signed and timed. The cell requires a
              photo of the empty table and chip tray, and the photos show both completely clear.
              The CNC cell has had a line-clearance process for two years.`,
            clue: { id: "c2-cnc-clear", fits: ["Method"], title: "CNC line clearance was done",
                    text: "Signed checklist with photos: the CNC cell was completely clear between the two lots." },
          },
          {
            id: "program",
            minutes: 30,
            label: "Check the CNC programs",
            text: `Separate, correct programs for L and R. Each lot had a first-article inspection
              that matched the right part number. The machine made exactly what it was told to.`,
            clue: { id: "c2-program", fits: ["Machine"], title: "CNC programs are correct",
                    text: "Separate programs for L and R, and both first articles passed." },
          },
        ],
      },
      {
        id: "finishing",
        name: "Finishing",
        icon: "🌀",
        description: "Vibratory tumblers deburr parts after machining. Parts go in by the tote.",
        actions: [
          {
            id: "tumbler-log",
            minutes: 20,
            label: "Read the tumbler log",
            text: `Tumbler #2: lot 3304 (R) ran 1:40 to 2:40 PM. Lot 3305 (L) ran 2:50 to 3:50 PM.
              <b>Same tumbler, ten minutes apart.</b> Parts are unloaded through a screen that
              separates them from the ceramic media.`,
            clue: { id: "c2-tumbler-log", fits: ["Machine", "Method"], title: "Both lots used tumbler #2",
                    text: "The R lot and then the L lot went through the same tumbler, ten minutes apart." },
          },
          {
            id: "finish-tech",
            minutes: 30,
            label: "Interview the finishing tech",
            text: `"We dump and screen the media when we change to a different material, so
              aluminum dust doesn't get on steel. Between part numbers of the same material? No,
              we just unload and load the next tote. <b>Nobody's ever asked us to.</b> Small
              parts can hide in the media, sure. But they come out eventually."`,
            clue: { id: "c2-no-purge", fits: ["Method"], title: "Tumbler isn't cleared between part numbers",
                    text: "Media is only emptied between materials, not between part numbers. Parts can hide in the media." },
          },
          {
            id: "media",
            minutes: 30,
            label: "Dig through the media in tumbler #2",
            text: `You run your hands through the ceramic media and pull out <b>one more
              BRK-310-R bracket</b>. It's been tumbling with every job since yesterday.`,
            clue: { id: "c2-media", fits: ["Machine", "Method"], title: "Found an R part in the media",
                    text: "A right-hand bracket was still hiding in tumbler #2's media, a day later." },
          },
        ],
      },
      {
        id: "records2",
        name: "Inventory & Shipping",
        icon: "🗄️",
        description: "Lot counts, inventory adjustments, and shipping labels.",
        actions: [
          {
            id: "r-count",
            minutes: 20,
            label: "Check what happened to the R lot (3304)",
            text: `Lot 3304 (R) left finishing with <b>38 pieces, not 50</b>. Shipping recorded the
              shortage and the system logged a 12-piece inventory adjustment: "lost in process."
              Nobody investigated where they went.`,
            clue: { id: "c2-r-short", fits: ["Method", "Measurement"], title: "The R lot came up 12 short",
                    text: "The right-hand lot lost exactly 12 parts in finishing. It was written off as 'lost in process' with no investigation." },
          },
          {
            id: "labels",
            minutes: 20,
            label: "Check the label printing record",
            text: `The BRK-310-L label for lot 3305 was printed from the traveler and matches it
              exactly. The printer and the label template are fine.`,
            clue: { id: "c2-labels", fits: ["Method"], title: "Labels were correct",
                    text: "The label matches the traveler. No printing error." },
          },
        ],
      },
      {
        id: "inspect2",
        name: "Final Inspection & Packing",
        icon: "🔍",
        description: "Parts are sampled, then packed and labeled.",
        actions: [
          {
            id: "plan2",
            minutes: 20,
            label: "Review the BRK-310 inspection plan",
            text: `Sample 8 parts per lot: overall length, hole diameters, flatness. A mirror-image
              part measures <b>exactly the same on every one of these</b>. Nothing on the plan
              checks which hand the part is, and neither part is marked with its part number.`,
            clue: { id: "c2-no-id-check", fits: ["Measurement"], title: "Inspection can't tell L from R",
                    text: "The sampled checks are all identical for L and R. Nothing verifies part identity, and the parts aren't marked." },
          },
          {
            id: "packer",
            minutes: 30,
            label: "Interview the packer",
            text: `"I pack what comes out of finishing. The tote tag said L, I counted 50, I packed
              50. Honestly, you can't tell them apart unless you hold an L and an R side by
              side."`,
            clue: { id: "c2-packer", fits: ["People", "Measurement"], title: "Packer trusted the tote tag",
                    text: "The packer counted and packed what came in the L tote. L and R look the same on their own." },
          },
        ],
      },
    ],

    problem: "R parts in L lot 3305",

    occurrence: [
      { text: "Ray didn't clear the CNC cell between the two lots.",
        score: 0, blame: true,
        feedback: "Blame, and the evidence says otherwise: the CNC clearance was signed and photographed, and Ray counted 50 into each tote." },
      { text: "The packer grabbed parts from the wrong tote.",
        score: 0, blame: true,
        feedback: "The packer packed exactly what arrived in the L tote. The mix happened before packing." },
      { text: "The CNC program for the L part was wrong.",
        score: 0,
        feedback: "Red herring. Separate, correct programs, and both first articles passed." },
      { text: "The label printer printed the wrong label.",
        score: 0,
        feedback: "Red herring. The label was correct. The parts inside were the problem." },
      { text: "Mirror-image parts shouldn't be scheduled back to back.",
        score: 0.25,
        feedback: "Scheduling made the mix possible, but plants run similar parts back to back every day. The gap is that nothing clears the shared tumbler between part numbers." },
      { text: "Tumbler #2 isn't cleared between part numbers. Right-hand parts that hid in the media came out with the left-hand lot, and there's no line-clearance requirement for shared finishing equipment.",
        score: 1, needs: ["c2-tumbler-log", "c2-no-purge"],
        feedback: "Exactly. The CNC cell has line clearance, but the shared tumbler downstream never did." },
    ],

    escape: [
      { text: "The final inspector picked a bad sample.",
        score: 0, blame: true,
        feedback: "Blame. The inspector followed the plan, and the plan's checks can't tell L from R anyway." },
      { text: "The sample size was too small. Inspect 13 parts instead of 8.",
        score: 0.25,
        feedback: "A bigger sample only helps if the checks can detect the defect, and these can't. Part identity needs 100% verification or error-proofing such as part marking." },
      { text: "The 12-piece shortage on the R lot should have triggered an investigation.",
        score: 0.5, needs: ["c2-r-short"],
        feedback: "Sharp catch. That write-off was a real warning signal that was ignored. But even with it, nothing at inspection could tell L from R, so it's only part of the escape." },
      { text: "Nothing verifies part identity on every part. Mirror-image parts aren't marked, and the sampled dimensional checks can't tell L from R.",
        score: 1, needs: ["c2-no-id-check"],
        feedback: "Correct. When defective parts measure identical to good ones, sampling can't save you. You need 100% identity verification or a part that can't be confused." },
    ],

    solution: `Lot 3304 (right-hand) went through tumbler #2 right before lot 3305 (left-hand).
      <b>Twelve R parts stayed hidden in the media</b> and came out with the L lot ten minutes
      later. The CNC cell had a solid line-clearance process, but <b>the shared tumbler never
      did</b>: media was only emptied between materials, never between part numbers. The R lot
      showed up 12 short, but it was written off as "lost in process" and nobody asked where the
      parts went. At final inspection, every sampled check measured an R part the same as an L
      part, and the parts weren't marked, so <b>nothing could tell them apart</b>. The best fixes
      are line clearance at every shared operation, investigating count discrepancies, and laser
      marking the part number so the parts can't be confused.`,
  },
  // ===================================================================
  {
    id: "drifting-mic",
    title: "Case #3: The Trusted Gage",
    tagline: "Our records say every shaft was good. The customer's CMM disagrees.",
    minutes: 190,
    briefing: `
      <p><b>Customer:</b> a hydraulics manufacturer &nbsp;·&nbsp; <b>Part:</b> pump shaft SH-118
      &nbsp;·&nbsp; <b>Lot:</b> 4410 (60 pcs) &nbsp;·&nbsp; <b>Spec:</b> OD Ø15.875 ±0.013 mm</p>
      <p>The customer's CMM found <b>22 of 60 shafts undersize</b> on the bearing diameter, by
      0.015 to 0.025 mm. The shafts won't hold a press fit.</p>
      <p>Your inspection records show <b>every shaft measured in tolerance</b>, both in-process
      and at final. The plant manager says the customer's CMM must be wrong.</p>
      <p class="assignment">Find out <b>why the shafts were made undersize</b> (occurrence) and
      <b>why your own measurements said they were good</b> (escape).</p>`,

    locations: [
      {
        id: "office3",
        name: "Quality Office",
        icon: "📋",
        description: "The customer's CMM report and your own inspection records.",
        actions: [
          {
            id: "complaint3",
            minutes: 10,
            label: "Read the customer's CMM report",
            text: `22 of 60 shafts measure Ø15.847 to Ø15.858: undersize by 0.015 to 0.025 mm. The
              customer re-checked them on a second CMM and with a calibrated bore gage ring. Same
              result. The undersize is <b>very consistent</b>, about 0.02 mm, on the later parts in
              the lot.`,
            clue: { id: "c3-complaint", fits: ["Symptom"], title: "22 shafts undersize by ~0.02 mm",
                    text: "Consistent undersize of about 0.02 mm, confirmed on two customer CMMs. Mostly the later parts in the lot." },
          },
          {
            id: "records3",
            minutes: 20,
            label: "Pull your inspection records for lot 4410",
            text: `In-process checks and final inspection both show all 60 shafts between Ø15.870
              and Ø15.880: comfortably in tolerance. <b>Every reading, in-process and final, was
              taken with the same micrometer: QM-047.</b>`,
            clue: { id: "c3-records", fits: ["Measurement"], title: "All readings came from QM-047",
                    text: "Our records show all 60 in tolerance. In-process and final inspection both used micrometer QM-047." },
          },
        ],
      },
      {
        id: "lathe",
        name: "CNC Lathe",
        icon: "🏭",
        description: "Where SH-118 is turned. The operator checks the bearing diameter every 5th part.",
        actions: [
          {
            id: "luis",
            minutes: 30,
            label: "Interview Luis (lathe operator)",
            text: `"About halfway through the lot, the parts started reading big on the mic, around
              +0.02. So I bumped the X offset down 0.02 and they came right back to nominal.
              That's my job: keep them on size."`,
            clue: { id: "c3-luis", fits: ["People", "Method"], title: "Luis offset 0.02 to match the mic",
                    text: "Mid-lot, parts read +0.02 on the mic, so the operator cut 0.02 smaller to bring them back to nominal." },
          },
          {
            id: "offset-log",
            minutes: 20,
            label: "Check the machine's offset history",
            text: `The control's log shows a single X-offset change of −0.020 mm at part 24. The
              customer's undersize parts start right around part 25. Before that change, the
              parts the customer measured were fine.`,
            clue: { id: "c3-offset", fits: ["Machine", "Method"], title: "Offset change at part 24",
                    text: "A −0.020 mm offset change at part 24 lines up exactly with where the undersize parts begin." },
          },
          {
            id: "insert",
            minutes: 30,
            label: "Inspect the cutting insert",
            text: `The insert shows normal light wear, well within its life. Insert wear would make
              parts gradually <b>bigger</b>, not suddenly smaller.`,
            clue: { id: "c3-insert", fits: ["Machine"], title: "Insert wear is normal",
                    text: "Light, normal wear. Wear would make parts bigger over time, not suddenly smaller." },
          },
        ],
      },
      {
        id: "lab",
        name: "Metrology Lab",
        icon: "🔬",
        description: "Calibration records, certified gage blocks, and a temperature-controlled room.",
        actions: [
          {
            id: "cal-record",
            minutes: 20,
            label: "Pull QM-047's calibration record",
            text: `Calibrated 2 months ago. As-found and as-left both in tolerance. Next due in 4
              months. <b>The calibration is current</b>, and the sticker on the micrometer
              matches.`,
            clue: { id: "c3-cal-current", fits: ["Measurement"], title: "QM-047's calibration is current",
                    text: "Calibrated 2 months ago, passed as-found and as-left, not due for 4 months." },
          },
          {
            id: "check-std",
            minutes: 30,
            label: "Measure a certified gage block with QM-047",
            text: `You measure a certified 15.875 mm gage block. QM-047 reads <b>15.896: 0.021 mm
              high</b>. A second micrometer from the crib reads 15.875 exactly. The anvil face on
              QM-047 has a small nick on one edge.`,
            clue: { id: "c3-check-std", fits: ["Measurement"], title: "QM-047 reads 0.021 mm high",
                    text: "On a certified 15.875 gage block, QM-047 reads 15.896. A second mic reads it correctly. The anvil is nicked." },
          },
          {
            id: "temp",
            minutes: 20,
            label: "Check temperature records",
            text: `The shop held 20 to 22 °C all week, and parts sit at the bench before they're
              measured. Thermal growth on a 16 mm steel shaft at those temperatures is well under
              0.002 mm.`,
            clue: { id: "c3-temp", fits: ["Environment"], title: "Temperature isn't the cause",
                    text: "Shop held 20-22 °C. Thermal effects are under 0.002 mm, about a tenth of the error." },
          },
        ],
      },
      {
        id: "bench",
        name: "Inspection Bench",
        icon: "📏",
        description: "Shared bench where gages are kept during the shift.",
        actions: [
          {
            id: "priya",
            minutes: 30,
            label: "Interview Priya (inspector at the next bench)",
            text: `"Oh, QM-047? It got knocked off the bench last Tuesday, mid-shift. Hit the
              concrete pretty hard. Luis picked it up, looked it over, and said it was fine. Nobody
              wrote anything down. We don't really have a form for that."`,
            clue: { id: "c3-dropped", fits: ["Measurement", "People", "Environment"], title: "QM-047 was dropped mid-lot",
                    text: "The micrometer fell onto concrete during lot 4410. It was looked over, judged 'fine', and put back in use." },
          },
          {
            id: "wi3",
            minutes: 20,
            label: "Read the SH-118 work instruction",
            text: `It says which micrometer range to use and to check every 5th part. It says
              <b>nothing about verifying the gage</b> against a standard before use, and there is
              <b>no procedure for a dropped or damaged gage</b>. The gage program only relies on
              the calibration interval.`,
            clue: { id: "c3-no-verify", fits: ["Method", "Measurement"], title: "No check before use, no dropped-gage rule",
                    text: "The work instruction has no gage verification before use, and there's no process to quarantine a dropped gage." },
          },
        ],
      },
    ],

    problem: "Undersize shafts, lot 4410",

    occurrence: [
      { text: "Luis made a bad offset adjustment.",
        score: 0, blame: true,
        feedback: "Blame. Luis did exactly what he's supposed to do: adjust to keep parts on size according to his gage. The gage lied to him." },
      { text: "The micrometer was out of calibration.",
        score: 0.25,
        feedback: "Close, but its calibration was current. The gage was damaged after it was calibrated. A calibration sticker only tells you the gage was good on the day it was checked." },
      { text: "QM-047 was damaged when it was dropped and read 0.021 mm high. The offset was adjusted to match it, and nothing required checking the gage against a standard before use or pulling a dropped gage from service.",
        score: 1, needs: ["c3-check-std", "c3-offset"],
        feedback: "Exactly. The process trusted the calibration sticker instead of verifying the gage, so a damaged gage drove the machine." },
      { text: "The cutting insert wore and started cutting undersize.",
        score: 0,
        feedback: "Red herring. Insert wear makes parts bigger, and this insert was barely worn." },
      { text: "The parts were measured warm and shrank as they cooled.",
        score: 0,
        feedback: "Red herring. The thermal effect is under 0.002 mm, a tenth of the error, and parts were measured at room temperature." },
    ],

    escape: [
      { text: "The final inspector measured the shafts wrong.",
        score: 0, blame: true,
        feedback: "Blame. The inspector measured carefully, with a damaged gage." },
      { text: "Final inspection used the same damaged micrometer (QM-047) that set the offset. The same faulty gage both made the parts and approved them, so nothing independent ever checked.",
        score: 1, needs: ["c3-records", "c3-check-std"],
        feedback: "Correct. When the in-process gage and the final gage are the same tool, a gage error can never be caught. It just gets confirmed twice." },
      { text: "The calibration interval is too long. Calibrate every month instead of every 6.",
        score: 0.25,
        feedback: "Shorter intervals shrink the window, but a gage can be dropped the day after calibration. A check against a standard before use catches it the same day." },
      { text: "The final inspection sample was too small.",
        score: 0,
        feedback: "Sample size doesn't matter if every measurement is wrong by the same 0.021 mm." },
    ],

    solution: `Micrometer QM-047 was knocked onto the concrete mid-lot. Its anvil was nicked, and
      from then on it read <b>0.021 mm high</b>. It looked fine and its calibration sticker was
      current, so it went right back into use. Luis saw the parts "reading big" and did his job:
      he moved the offset −0.020 mm to bring them back to nominal on the mic, which actually made
      them <b>undersize</b>. Final inspection used <b>the same micrometer</b>, so every bad
      shaft "passed." The fixes: verify gages against a standard at the start of each shift,
      pull any dropped gage from service until it's checked, and use an independent gage at
      final inspection.`,
  },

  // ===================================================================
  {
    id: "soft-batch",
    title: "Case #4: The Soft Batch",
    tagline: "The supplier's cert was perfect. That was the problem.",
    minutes: 180,
    briefing: `
      <p><b>Customer:</b> an aerospace actuator maker &nbsp;·&nbsp; <b>Part:</b> hinge pin PIN-77,
      17-4 PH stainless &nbsp;·&nbsp; <b>Lot:</b> 5120 (200 pcs)</p>
      <p>The customer's actuators are failing endurance testing: the hinge pins are
      <b>galling and wearing</b> far too fast. Their lab tested the pins at <b>29 to 31 HRC</b>.
      The drawing requires <b>H900 condition, 40 HRC minimum</b>.</p>
      <p>You machine PIN-77, then send it out to HeatCo for heat treatment. HeatCo is on
      dock-to-stock: their parts go straight to inventory with a cert review. Your plant manager
      wants HeatCo disqualified by Friday.</p>
      <p class="assignment">Find out <b>why the pins are too soft</b> (occurrence) and <b>why
      receiving let them in</b> (escape).</p>`,

    locations: [
      {
        id: "office4",
        name: "Quality Office",
        icon: "📋",
        description: "The customer's lab report and the drawing.",
        actions: [
          {
            id: "complaint4",
            minutes: 10,
            label: "Read the customer's lab report",
            text: `Hardness on 10 pins: 29 to 31 HRC. Microstructure is consistent with 17-4 PH in
              an <b>overaged</b> condition: fully heat treated, just to a softer condition. The
              pins aren't untreated; they were treated to the wrong spec.`,
            clue: { id: "c4-complaint", fits: ["Symptom"], title: "Pins are 29-31 HRC, fully heat treated",
                    text: "Pins were heat treated, but to a soft, overaged condition. Spec is 40 HRC minimum." },
          },
          {
            id: "drawing4",
            minutes: 10,
            label: "Check the PIN-77 drawing",
            text: `Material: 17-4 PH stainless. <b>Heat treat: condition H900, 40 HRC minimum.</b>
              The drawing has been at this revision for three years.`,
            clue: { id: "c4-drawing", fits: ["Method"], title: "Drawing requires H900, 40 HRC min",
                    text: "PIN-77 must be heat treated to condition H900, 40 HRC minimum." },
          },
        ],
      },
      {
        id: "purchasing",
        name: "Purchasing",
        icon: "🧾",
        description: "Purchase orders to outside processors.",
        actions: [
          {
            id: "po",
            minutes: 20,
            label: "Pull the purchase order to HeatCo",
            text: `PO 88213 for lot 5120 reads: "Heat treat 200 pcs 17-4 PH to <b>condition
              H1150</b>." The PO's notes and formatting are identical to PO 88107, written last
              month for <b>PIN-75</b>, a different pin that really is H1150.`,
            clue: { id: "c4-po", fits: ["Method"], title: "The PO says H1150, copied from PIN-75",
                    text: "PO 88213 calls out H1150. It's a copy of an older PO for PIN-75, which really is H1150." },
          },
          {
            id: "buyer",
            minutes: 30,
            label: "Interview the buyer",
            text: `"I copy the last PO for that supplier and change the part number and quantity.
              Saves a ton of time. Checking the heat treat condition against the drawing? That's
              engineering's job, isn't it? Nobody reviews my POs before they go out."`,
            clue: { id: "c4-buyer", fits: ["People", "Method"], title: "POs are copied and never reviewed",
                    text: "The buyer copies old POs and edits them. There's no review of special-process requirements before a PO goes out." },
          },
        ],
      },
      {
        id: "supplier",
        name: "Call HeatCo",
        icon: "📞",
        description: "Your outside heat treater.",
        actions: [
          {
            id: "heatco",
            minutes: 30,
            label: "Call HeatCo's quality manager",
            text: `"We ran lot 5120 to H1150, exactly like your PO said. Here are the furnace
              charts: 1150 °F for 4 hours, right on recipe. If you needed H900, the PO should
              have said H900." Their furnace records and cert match the PO perfectly.`,
            clue: { id: "c4-heatco", fits: ["Material", "Method"], title: "HeatCo did exactly what the PO said",
                    text: "Furnace charts show H1150, correctly executed per the PO." },
          },
        ],
      },
      {
        id: "receiving4",
        name: "Receiving",
        icon: "📦",
        description: "Where outside-processed parts come back in.",
        actions: [
          {
            id: "cert4",
            minutes: 20,
            label: "Read HeatCo's cert for lot 5120",
            text: `"PIN-77, lot 5120, 200 pcs. 17-4 PH. <b>Condition H1150. Hardness 30 HRC</b>
              (sample of 5)." The answer was printed on the cert. It's stamped "Received,
              cert OK."`,
            clue: { id: "c4-cert", fits: ["Measurement", "Material"], title: "The cert said H1150, 30 HRC",
                    text: "HeatCo's cert plainly stated H1150 and 30 HRC. It was stamped 'cert OK'." },
          },
          {
            id: "receiving-proc",
            minutes: 20,
            label: "Read the receiving procedure",
            text: `For dock-to-stock suppliers: "Verify a certificate is present and that the lot
              number and quantity match the packing slip." <b>There is no step to compare the
              cert's values to the drawing requirements.</b>`,
            clue: { id: "c4-receiving", fits: ["Measurement", "Method"], title: "Receiving only checks the cert exists",
                    text: "The procedure checks that a cert is present and the lot matches. It never compares cert values to the drawing." },
          },
          {
            id: "clerk",
            minutes: 30,
            label: "Interview the receiving clerk",
            text: `"Cert was in the box, lot number matched, quantity matched. I stamped it.
              Honestly, I don't know what H1150 or H900 means. Nobody's ever trained me on that."`,
            clue: { id: "c4-clerk", fits: ["People", "Measurement"], title: "Clerk followed the procedure",
                    text: "The clerk did what the procedure asks: check the cert exists and the lot matches." },
          },
        ],
      },
      {
        id: "shop4",
        name: "Machine Shop",
        icon: "🏭",
        description: "Where PIN-77 is machined before heat treat.",
        actions: [
          {
            id: "bar",
            minutes: 20,
            label: "Check the raw bar certs",
            text: `17-4 PH bar from an approved mill. Chemistry is in spec. The material is
              correct; it was just heat treated to the wrong condition.`,
            clue: { id: "c4-bar", fits: ["Material"], title: "Raw material is correct 17-4 PH",
                    text: "Bar stock chemistry is in spec from an approved mill." },
          },
          {
            id: "dims4",
            minutes: 20,
            label: "Check the machining records",
            text: `Every dimension on lot 5120 is in tolerance. Machining isn't involved; hardness
              comes entirely from heat treatment.`,
            clue: { id: "c4-dims", fits: ["Machine"], title: "Machining was fine",
                    text: "All dimensions in tolerance. Hardness comes from heat treat, not machining." },
          },
        ],
      },
    ],

    problem: "Soft pins, lot 5120",

    occurrence: [
      { text: "HeatCo heat treated the pins wrong. Disqualify them.",
        score: 0, blame: true,
        feedback: "HeatCo did exactly what your PO told them to, and their furnace charts prove it. Disqualifying them would punish the one party that did its job." },
      { text: "The buyer made a typo on the PO.",
        score: 0, blame: true,
        feedback: "It wasn't a typo: the buyer copied an old PO, which the process allowed. The gap is that nothing checks a PO's special-process requirements against the drawing." },
      { text: "PO 88213 was copied from another part's PO and called out H1150 instead of H900, and nothing in the purchasing process checks special-process requirements on a PO against the drawing.",
        score: 1, needs: ["c4-po", "c4-drawing"],
        feedback: "Exactly. The wrong requirement went out on the PO, and the system had no way to catch it." },
      { text: "The wrong raw material was used.",
        score: 0,
        feedback: "Red herring. The bar is correct 17-4 PH. It was treated to the wrong condition." },
      { text: "HeatCo's quality system needs an audit.",
        score: 0.25,
        feedback: "An audit would find furnace records that match the PO perfectly. The problem started in your own purchasing department." },
    ],

    escape: [
      { text: "The receiving clerk should have caught it.",
        score: 0, blame: true,
        feedback: "Blame. The clerk followed the procedure exactly, and was never trained on heat treat conditions." },
      { text: "Receiving only checks that a cert exists and the lot matches. Nobody compares the cert's condition and hardness to the drawing, even though the cert said H1150 and 30 HRC in plain sight.",
        score: 1, needs: ["c4-cert", "c4-receiving"],
        feedback: "Correct. A cert is only useful if somebody reads it against the requirement. This one told you the problem on day one." },
      { text: "Dock-to-stock should never be allowed for outside processors.",
        score: 0.25,
        feedback: "Dock-to-stock is fine for proven suppliers, and HeatCo performed perfectly. The gap is that the cert review never checked the values." },
      { text: "The customer should have hardness-tested the pins at receiving.",
        score: 0,
        feedback: "Your job is to ship conforming parts. 'The customer should have caught it' isn't an escape analysis." },
    ],

    solution: `The buyer created PO 88213 by copying last month's PO for PIN-75, a different pin
      that really is H1150, and the PO went out calling for <b>H1150 instead of H900</b>. HeatCo
      did exactly what the PO said, and their furnace charts and cert prove it. The cert came back
      reading <b>"Condition H1150, 30 HRC"</b>, but receiving only checked that a cert was present
      and the lot number matched, so it was stamped "cert OK." The plant manager was ready to
      disqualify the only party that did its job. The fixes: review special-process requirements
      on every PO against the drawing, and have receiving verify cert values against the
      requirement, not just that a cert exists.`,
  },
];


