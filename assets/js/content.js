// Prose sections of the plan, in light markdown (rendered by md.js).
// Tables that come from numbers (layout, calendar, workouts, progression) are built from plan.js instead.

export const QUICK_START = `Gym is always Tuesday, Thursday and Saturday, Muay Thai is always Monday, Wednesday and Friday at 17:00, and Sunday is always off.

- **Week A** (3 gym + 3 Muay Thai): the full week above.
- **Week B** (3 gym + 2 Muay Thai): skip Friday's class. This is your heaviest lifting week.
- **Week C** (2 gym + 3 Muay Thai): skip Thursday's gym. Tuesday and Saturday become Sessions X and Y at lighter loads. This is your deload.
- **Rotation:** A, B, C, four times, starting Monday Oct 5. Test week is Dec 28–31.`;

export const APPROACH = `Lift heavy and short on the days you don't do Muay Thai, let Muay Thai be your conditioning, and lift lighter in the weeks Muay Thai goes up.

- **About 24 h between sessions.** Gym and Muay Thai alternate days. Studies find 24 h between strength and hard conditioning works best, and 6 h is the minimum if you ever double up.
- **Protect explosiveness, not just strength.** Concurrent training barely dents maximal strength, but it can blunt explosive strength, mostly when both happen in one session. So every gym day opens with a short power block, and there are no metcons.
- **Load balancing.** A weeks: moderate lifting plus full Muay Thai. B weeks: your heaviest lifting with one class fewer. C weeks: two lighter gym sessions while Muay Thai stays at three.
- **Periodized, then peaked.** Four 3-week cycles: Base (5s), Build (4s), Strength (3s), Peak (singles), then a test. Periodized programs give bigger 1RM gains than repeating the same week.
- **Planned kg, checked by RPE.** Each top set has a weight and a target RPE, then back-off sets follow, in 5/3/1-style planned waves with a deload. RPE-based loading has done at least as well as fixed percentages.
- **Bench twice a week, squat and deadlift once heavy.** Bench is your slowest lift, and Muay Thai already loads your legs hard.
- **Muay Thai carryover built in.** Rotational med-ball throws, adductors, neck, grip, shoulder endurance and hamstrings.`;

export const TARGETS_LEAD = `Squat 100 kg is realistic, bench 80 kg is a stretch at 73 kg, and deadlift 140 kg is unlikely; plan for 130–135 kg.`;

export const TARGETS_NOTES = `- You're early in strength terms: five months of CrossFit isn't max-strength training, so squat and deadlift can climb fast.
- Deadlift +25 kg (+22%) in 12 weeks, lifting 2–3 times a week next to Muay Thai at maintenance calories, is more than most people manage. +15–20 kg is a great result.
- Bench +7.5 kg (+10%) without gaining weight is possible but at the edge. Upper-body strength grows slowest at flat bodyweight; 1–2 kg more bodyweight would make 80 likelier.
- The plan still chases the stretch numbers: when top sets feel easier than planned, the numbers move up (see Adjustment rules, or add an adjustment in Settings).

Calisthenics by Dec 31: pull-ups 15+ (from 12), dips 25+ (from 22), a first bar muscle-up, a 10–15 s L-sit, and a 60 s chest-to-wall handstand with 5–10 s freestanding.`;

export const LAYOUT_NOTES = `- **Why the Mon/Wed/Fri classes:** they're the only set that gives three classes a week with no double days, and they end at 18:00, which protects sleep.
- **Why Friday is the class you drop in B weeks:** it gives you a rest day before Saturday's heaviest deadlift.
- **When to lift:** 11:00–15:00 on Tue and Thu, 10:00–13:00 on Sat, when lectures allow. That's at least 17 h after the last class and 26 h before the next.
- **Lectures in the way:** any time works if it's at least 6 h from a class. Never lift right before Muay Thai.
- **Backup classes:** missed a Mon/Wed/Fri class and want it back? Take that week's Tue or Thu 20:45 class and lift that morning, at least 6 h before. Gym first, never the other way round.`;

export const CALENDAR_NOTE = `Exams can reshuffle the weeks inside a cycle (see Adjustment rules). Christmas lands in the taper week, so classes cancelled Dec 24–26 cost you nothing.`;

export const WARMUP = `The same 15 minutes opens every gym session: raise, mobilise, activate, a handstand block, then ramp-up sets.

| Part | Exercise | Dose |
| --- | --- | --- |
| Raise | Jump rope (or bike/rower), easy to brisk | 3 min |
| Mobilise | World's greatest stretch | 3/side |
| Mobilise | 90/90 hip switches | 6/side |
| Mobilise | Knee-to-wall ankle rocks | 10/side |
| Mobilise | Open-book T-spine rotation | 6/side |
| Mobilise | Band pass-throughs | 10 |
| Activate | Band pull-aparts | 15 |
| Activate | Scap push-ups | 10 |
| Activate | Dead bug | 6/side |
| Activate | Glute bridge | 10 |
| Activate | Slow neck circles + chin tucks | 5 each way + 10 |
| Skill | Wrist prep (1 min) + handstand block (Calisthenics skills) | 5 min |

### Ramp-up sets

Work up to the first barbell lift like this, as % of today's top set.

| Set | Load | Reps |
| --- | --- | --- |
| 1 | Empty bar (deadlift: 60 kg) | 8–10 |
| 2 | 40% | 5 |
| 3 | 60% | 3 |
| 4 | 75% | 2 |
| 5 | 85–90% | 1 |
| 6 (singles weeks only) | 93–95% | 1 |

Rest 1–2 min between ramp sets and 3 min before the top set. For the session's second barbell lift, do sets 1, 3 and 4 only; in deload weeks, sets 1–3.

### Before Muay Thai (5 min, on top of the class warm-up)

- Neck isometrics, hand against head: 4 directions × 10 s
- Band pull-aparts × 15
- Hip circles × 10/side
- Ankle hops × 20

### Cool-down (optional, 5 min)

Pike stretch 2 × 30 s for the L-sit, couch stretch 30 s/side, dead hang 30 s.`;

export const BEFORE_MT = [
  'Neck isometrics, hand against head: 4 directions × 10 s',
  'Band pull-aparts × 15',
  'Hip circles × 10/side',
  'Ankle hops × 20',
];

export const WORKOUTS_INTRO = `Each session runs warm-up, power, main lift, second lift, supersets, then neck and grip, in about 75–85 minutes.

- Main-lift weights come from the progression tables for this week number.
- C1–C4 are the cycles: C1 Base (W1–3), C2 Build (W4–6), C3 Strength (W7–9), C4 Peak (W10–12).
- Letters (5a, 5b…) are supersets: one set of each in turn, resting as listed.
- In C4, drop one set from the power block and from each accessory.`;

export const FINISHERS = `Only in A and B weeks of C1–C3, only if the session went to plan, and never when you're already sore for the next day's class.

- **Clinch grip:** 4 rounds of 30 s towel hang + 30 m farmer carry.
- **Core EMOM 10:** odd minutes 30 s hollow hold, even minutes 30 s side plank, alternating sides.
- **Sled (Saturday only):** 8 × 20 m sled push or backward drag at moderate effort. It's concentric-only, so it leaves little soreness.`;

export const CWEEK_RULES = `In C weeks all three main lifts fit into two sessions at deload loads, about 70 minutes each. Technique notes and substitutions are the same as Days 1–3.

- Accessories stay at RIR 3 (three reps left), 2 sets each; no finishers.
- Skill work stays the same, because it's low-fatigue practice.
- Muay Thai stays at three classes. If you want a hard sparring week, make it a C week.
- Week 12 (taper) uses shorter versions of X and Y.`;

export const PROGRESSION_INTRO = `Each 3-week cycle goes moderate (A), heavy (B), deload (C); reps drop from 5s to singles; you test squat and bench on Mon Dec 28 and deadlift on Wed Dec 30.

- **Top set:** one set at the planned kg, aiming for the target RPE (RPE 8 = 2 reps left).
- **Back-offs:** straight sets after the top set. Deload rows have no top set.
- **Adjust as you go:** a top set 1.5 RPE or more easier than target adds 2.5 kg (bench) or 5 kg (squat, deadlift) to that lift's later weeks. Add it in Settings and every number here updates.
- Weights assume 2.5 kg jumps. With 0.5–1.25 kg change plates, bench can climb in smaller steps.`;

export const TAPER = `- **Mon Dec 21 and Wed Dec 23:** Muay Thai if classes run, technique and light sparring only.
- **Tue Dec 22, short Session X:** the squat and bench taper rows, then pull-ups 2 × 3. Done in about 50 min.
- **Dec 24–25:** off.
- **Sat Dec 26, short Session Y:** deadlift 2 × 2 @ 100, squat 2 × 2 @ 70, paused bench 3 × 1 @ 62.5, no accessories. About 40 min.
- **Sun Dec 27:** rest. No hard sparring until your tests are done.`;

export const TEST_NOTES = `- Standard warm-up without handstands, then bar × 8, 50% × 5, 70% × 3 and 85% × 1 of your opener.
- Rest 4–5 min between attempts. Take a 4th attempt only if the 3rd was RPE 8 or easier; that's where a 140 deadlift lives.
- Test bench the way you tested 72.5 (touch-and-go or paused) and squat to your training depth, so the numbers compare.`;

export const SKILLS_TEXT = `Work toward three skills, bar muscle-up, L-sit and handstand, in short, frequent doses, with weighted pull-ups and dips as the strength base.

- **Bar muscle-up:** with 12 pull-ups and 22 dips you're close to the usual prerequisites, so it's the fastest first skill.
- **L-sit:** core compression that carries over to knees and teeps.
- **Handstand:** overhead shoulder stability and balance, and you can practise it almost daily with little fatigue.

Where they live: handstand in every warm-up (5 min, plus 5 min at home on rest days if you like); muscle-up in the Day 2 power block and the Day 2 and Session X EMOMs; L-sit in the same EMOMs.

| Cycle | Muscle-up drill | L-sit | Handstand |
| --- | --- | --- | --- |
| C1, W1–3 | Low-bar transition drill × 3, alternating rounds with straight-bar dips × 5 | Tuck L-sit on parallettes or dip bars, 15–20 s | Chest-to-wall hold 3 × 20–30 s; wall walk-ups |
| C2, W4–6 | Jumping muscle-up + 3–5 s lowering × 2, or band-assisted × 2 | One leg straight, alternate legs, 10–15 s | Chest-to-wall 3 × 40–45 s; shoulder taps 3 × 6/side; learn the cartwheel bail |
| C3, W7–9 | Muscle-up attempt × 1 (light band if needed; a small kip is fine while learning the turnover) | Full L-sit 5–10 s | Chest-to-wall 60 s; toe pulls off the wall 5 × 5–10 s |
| C4, W10–12 | Strict muscle-up × 1, or your best version | Full L-sit 10–15 s | Freestanding kick-ups, 10–15 tries, aiming for 5–10 s |

- Skill work is practice: end each set with good form left, never grind it.
- Elbows or wrists aching: drop the muscle-up drill to band-assisted pull-ups for a week; handstands on fists or parallettes.
- The L-sit needs hamstring length, so do the pike stretch in the cool-down.
- Weighted pull-ups (Day 1) and dips (Day 3): add 2.5 kg once every set is RPE 7 or less.`;

// What this cycle's skill drills are, for the Today view
export const SKILL_BY_CYCLE = {
  1: { mu: 'Low-bar transition drill × 3, alternating with straight-bar dips × 5', lsit: 'Tuck L-sit 15–20 s', hs: 'Chest-to-wall hold 3 × 20–30 s; wall walk-ups' },
  2: { mu: 'Jumping muscle-up + 3–5 s lowering × 2, or band-assisted × 2', lsit: 'One leg straight, alternate legs, 10–15 s', hs: 'Chest-to-wall 3 × 40–45 s; shoulder taps 3 × 6/side' },
  3: { mu: 'Muscle-up attempt × 1 (light band if needed)', lsit: 'Full L-sit 5–10 s', hs: 'Chest-to-wall 60 s; toe pulls 5 × 5–10 s' },
  4: { mu: 'Strict muscle-up × 1, or your best version', lsit: 'Full L-sit 10–15 s', hs: 'Freestanding kick-ups, 10–15 tries' },
};

export const RULES = `Follow the planned numbers on normal days, cut back on bad days, and never make up a missed session by doubling up.

### Beat up after Muay Thai: the daily check

Rate yourself after the warm-up, before your first work set.

| Signal | Looks like | Do this |
| --- | --- | --- |
| Green | 7+ h sleep, normal soreness, warm-ups move well | The plan as written |
| Yellow | Sore or flat after class, 6–7 h sleep, warm-ups feel heavy | Top set 5% lighter, RPE 8 cap, one back-off fewer, 2 power sets, no finisher |
| Red | Under 6 h sleep, ill below the neck, a knock that changes how you move | Main lifts only, 3 × 3 at about 70%, out in 40 min, or rest |

- **Head knocks:** headache, dizziness, nausea or blurred vision after sparring means no lifting or sparring until the symptoms are gone and a doctor clears you.
- **Local damage:** sore shins or feet, swap box jumps for med-ball throws; bruised ribs, skip ab wheel and hanging work; stiff neck from the clinch, skip neck work that day.

### Missed a session

- **One gym day:** do it the next day if that's at least 6 h from a class, and shift the week. Otherwise finish the week as Sessions X and Y with this week's numbers.
- **A whole week:** repeat that week.
- **Two weeks or more:** restart at the last week you completed, 5% lighter.
- **A Muay Thai class:** let it go. Don't replace it with extra conditioning.

### Busy or exam week

- Make it a C week: two sessions of main lifts plus one superset, about 50 min. If it was an A or B week, keep that week's top sets with two back-offs.
- You can reorder the weeks inside a cycle (C first, then B), as long as every three weeks hold one C.
- Protect sleep (7.5 h+) before training volume.
- Really crushed: two 45-min sessions of main lifts only hold your strength for 2–3 weeks.

### Stalled on a lift

A stall is missed reps, or a top set 1 RPE or more over target, two weeks in a row on the same lift.

1. Check sleep, food and how hard Muay Thai was that week.
2. Repeat that week's numbers instead of moving on.
3. Still stuck: drop that lift 5–7.5% and climb back 2.5 kg a week.
4. Then add one fix: bench, close-grip bench 2 × 6 after the main bench; squat, pause squats 3 × 3 at 70% in place of the back-offs; deadlift, check grip (hook, mixed, straps on back-offs) and add RDL 3 × 6 after deadlifts.

### Moving faster than planned

- A top set 1.5 RPE or more under target: add 2.5 kg (bench) or 5 kg (squat, deadlift) to that lift's remaining weeks.
- Week 1 is calibration: RPE 5 or less, add the same amounts to all of that lift's numbers; RPE 8 or more, take them off.
- If you ever have to double up: lift first, Muay Thai at least 6 h later, and keep the lift to main lifts plus one superset.`;

export const NUTRITION = `Eat about 3,000 kcal and 145 g of protein a day, and steer by your 7-day average weight, not single weigh-ins.

| What | Daily target | How |
| --- | --- | --- |
| Calories | About 3,000 kcal (2,900–3,100) | The same every day is simplest |
| Protein | About 145 g (2 g/kg) | 4 meals × 35 g; 120 g (1.6 g/kg) is the floor |
| Carbs | 400–440 g (5.5–6 g/kg) | Most of it around training |
| Fat | 70–85 g (about 1 g/kg) | Don't go under about 60 g |
| Water | 3 L + about 0.75 L per training hour | Electrolytes on Muay Thai days |

Where 3,000 comes from: your resting burn is about 1,780 kcal (Mifflin–St Jeor), student life multiplies it by 1.4–1.5, and training adds 300–400 kcal a day averaged over the week. Your weekly load is close to 5–6 CrossFit sessions, so if you held 73 kg on that, your current intake is already about right.

### Meal timing

- **Gym:** a normal meal with carbs and protein 2–3 h before.
- **Muay Thai:** light carbs 60–90 min before (banana, toast with honey, rice cakes). Nothing heavy before body shots.
- **After either:** protein and carbs within about 2 h.
- **Before bed:** 30–40 g of slow protein, such as skyr, Greek yoghurt or cottage cheese.

### Staying at 73 kg

- Weigh every morning after the toilet and use the 7-day average.
- Keep it in a 72.5–74 kg band. If the 2-week trend leaves the band, change intake by 150–250 kcal a day, mostly carbs.
- Creatine monohydrate, 3–5 g a day, is the best-supported supplement for strength. It usually adds about 1 kg of scale weight, mostly water, so on creatine your band is 73–74.5 kg.
- Caffeine (about 200 mg) 45–60 min before lifting is fine; none after 15:00.

### Sleep and recovery

- 8–9 h in bed, with the same wake time every day, weekends too.
- Dark, cool room; phone away 30–60 min before lights out.
- Short night: a 20–30 min nap, and treat the day as yellow.
- Rest days: a 30–60 min walk, 10 min mobility, optional 5 min of handstand or L-sit practice.
- Spar light the day after a heavy squat day; save hard rounds for C weeks.
- Soreness is normal. Sharp pain, swelling, or pain that changes how you move means stop that exercise and get it checked.`;

export const TRACKING = `Log every top set as kg × reps @ RPE. The Log tab turns it into an estimated max (e1RM) for you, and the Progress tab plots it against the plan.

e1RM = weight ÷ the percentage in the table. Example: 85 kg × 3 @ RPE 8 is 85 ÷ 0.86 = 98.8 kg.

| Reps | RPE 7 | RPE 8 | RPE 9 | RPE 10 |
| --- | --- | --- | --- | --- |
| 1 | 89% | 92% | 96% | 100% |
| 2 | 86% | 89% | 92% | 96% |
| 3 | 84% | 86% | 89% | 92% |
| 4 | 81% | 84% | 86% | 89% |
| 5 | 79% | 81% | 84% | 86% |

RPE 7 = 3 reps left, 8 = 2 left, 9 = 1 left, 10 = nothing left.

- e1RMs rising cycle to cycle: stay the course.
- One lift flat for three weeks: see Stalled on a lift.
- Bodyweight out of the band for two weeks: see Staying at 73 kg.`;

export const EVIDENCE = `Each rule traces to one of these studies; the arrow says what it changed in your week.

- [Schumann et al., 2022, Sports Medicine](https://pmc.ncbi.nlm.nih.gov/articles/PMC8891239/): across 43 studies, adding aerobic work didn't reduce maximal strength or muscle growth, but it could blunt explosive strength, most when done in the same session. → A power block every gym day; lifting and Muay Thai on separate days.
- [Petré et al., 2021, Sports Medicine](https://pmc.ncbi.nlm.nih.gov/articles/PMC8053170/): in trained lifters, lower-body strength gains suffered when endurance work came within about 20 minutes of lifting, not when the sessions were over 2 h apart. → Never lift straight after class.
- [Robineau et al., 2016, Journal of Strength and Conditioning Research](https://journals.lww.com/nsca-jscr/fulltext/2016/03000/specific_training_effects_of_concurrent_aerobic.10.aspx): at least 6 h between strength and aerobic sessions was needed for full adaptation, and 24 h worked best. → About 24 h gaps; the 6 h rule for doubles.
- [Williams et al., 2017, Sports Medicine](https://link.springer.com/article/10.1007/s40279-017-0734-y): across 18 studies, periodized training improved 1RM more than non-periodized training, by a moderate margin. → 3-week cycles moving from 5s to singles.
- [Helms et al., 2018, Frontiers in Physiology](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2018.00247/full): RPE-based and percentage-based loading both built strength over 8 weeks, with a small likely edge for RPE. → Planned kg with RPE targets and adjustment rules.
- [Turner, 2009, Strength and Conditioning Journal](https://www.ovid.com/jnls/nsca-scj/abstract/10.1519/ssc.0b013e3181b99603~strength-and-conditioning-for-muay-thai-athletes): a needs analysis of Muay Thai that argues for gym-based strength and power work alongside skill training. → Power work, neck, grip and trunk in every week.
- [Morton et al., 2018, British Journal of Sports Medicine](https://academicworks.cuny.edu/le_pubs/209/): extra protein improved strength and muscle gains from lifting, with no further muscle gain above about 1.6 g/kg a day. → 145 g target, 120 g floor.
- [Kreider et al., 2017, ISSN creatine position stand](https://link.springer.com/article/10.1186/s12970-017-0173-z): creatine monohydrate is the most effective supplement for high-intensity training and holds a little extra water. → The creatine note and its weight band.

The RPE-to-percentage table is the common powerlifting RPE chart, rounded, so treat it as approximate.`;

export const REST_DAY = [
  '30–60 min walk',
  '10 min mobility',
  'Optional: 5 min handstand or L-sit practice',
  'Eat and sleep like a training day',
];
