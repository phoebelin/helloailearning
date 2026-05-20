# PRD: Pattern Learning Activity with Mori - "Find the Secret Rule"

## Introduction/Overview

This is the **second** step-by-step interactive activity in the AI literacy platform for kids ages 8-10. The activity teaches children how AI uses patterns to learn, through a "Find the Secret Rule" game with Mori—a friendly red fuzzy monster character.

In this activity, children:
1. Meet Mori and explore how Mori's brain works (visual metaphor showing pattern-matching areas)
2. "Feed" Mori examples by dragging visual items into Mori's mouth
3. Observe Mori's binary feedback (matches rule vs. doesn't match)
4. Try to guess the secret rule Mori learned

The activity solves key AI literacy gaps:
- **Pattern Recognition**: Children learn that AI fundamentally works by finding patterns in data
- **Hypothesis Testing**: Kids practice the scientific method—observe, hypothesize, test
- **Active Discovery**: Rather than being told how AI works, children discover it through play

**Prerequisite**: This activity unlocks after completing Activity 1 (Ecosystem Learning with Zhorai).

## Goals

1. Teach children ages 8-10 that AI learns by recognizing patterns in examples
2. Enable hands-on discovery through a drag-and-drop "feeding" mechanic where kids experiment with giving Mori different inputs
3. Develop hypothesis-testing skills as children form and refine guesses about the secret rule
4. Provide variable difficulty with multiple rule types (categories, patterns, logical rules)
5. Allow open-ended play—children can continue playing as long as they want
6. Explain *how* the AI identified the pattern after each successful guess, reinforcing learning
7. Complete each round within 3-5 minutes to maintain engagement for target age group

## User Stories

1. **As a student**, I want to see inside Mori's brain so that I can understand how it looks for patterns
2. **As a student**, I want to drag examples into Mori's mouth so that I can see what matches the secret rule
3. **As a student**, I want clear yes/no feedback from Mori so that I can figure out the pattern
4. **As a student**, I want to guess the rule using my voice or typing so that I feel like I'm solving a puzzle
5. **As a student**, I want to see how Mori found the pattern after I guess correctly so that I understand how AI learns
6. **As a student**, I want to keep playing with harder rules so that I can challenge myself
7. **As a teacher/parent**, I want the activity to be replayable with different rules so that students can practice pattern recognition multiple times
8. **As a teacher/parent**, I want to see what rules my child has solved so that I can track their progress

## Activity Sequence

### Step 1: Introduction to Mori
**Purpose**: Introduce the new character and set up the learning objective.

- **Heading**: "Meet Mori!"
- **Mori Character**: Display Mori (red fuzzy monster) with a friendly wave animation
- **Introduction Text**: "Mori is a pattern-finding monster! Mori learned a secret rule, and you need to figure out what it is."
- **Mori's Speech**: "Hi, I'm Mori! I learned something special. Can you figure out my secret rule?"
- **Action Button**: "See Mori's brain" (primary button)

**Technical Requirements**:
- Display Mori character with idle animation (subtle bounce/breathing)
- Text-to-speech for Mori's introduction (use distinct voice from Zhorai)
- Transition animation to next step

### Step 2: Explore Mori's Brain
**Purpose**: Visual metaphor showing how pattern recognition works in AI.

- **Heading**: "Inside Mori's Brain"
- **Brain Visualization**: Stylized brain graphic with highlighted "pattern-matching" regions
  - Show interconnected nodes lighting up when patterns are detected
  - Animate pathways connecting similar concepts
- **Explanation Text**: "Mori's brain lights up when it sees things that match a pattern. The more examples Mori sees, the better it gets at finding patterns!"
- **Interactive Element**: Kids can tap/click on different brain regions to see mini-animations of pattern matching
- **Mori's Speech**: "My brain looks for things that are the same. Feed me examples to see what I learned!"
- **Action Button**: "Start feeding Mori!" (primary button)

**Technical Requirements**:
- Animated SVG or canvas-based brain visualization
- Glowing/pulsing effects when pattern areas are "activated"
- Touch/click interactions on brain regions with explanatory tooltips
- Smooth transition animation to feeding interface

### Step 3: Feeding Interface - Main Gameplay
**Purpose**: Core gameplay loop where kids drag examples to discover the pattern.

- **Heading**: "Feed Mori to find the secret rule!"
- **Layout**:
  - **Left side**: Grid of draggable example cards (images with labels)
  - **Center**: Mori character with open mouth as drop zone
  - **Right side**: Two piles - "Matches!" (green) and "Doesn't Match" (red)
- **Example Cards**: 8-12 visual options relevant to the current rule
  - Each card shows an image + word label (e.g., picture of a cat + "Cat")
  - Cards can be dragged to Mori's mouth
- **Mori's Response**: 
  - **Match**: Happy animation, card flies to "Matches!" pile, Mori says "Yes! This matches my rule!"
  - **No Match**: Thinking/confused animation, card flies to "Doesn't Match" pile, Mori says "Hmm, this doesn't match."
- **Progress Indicator**: Show how many examples have been tested (e.g., "3/8 examples tried")
- **Action Buttons**:
  - "I think I know the rule!" (becomes prominent after 3+ examples tested)
  - "Show me a hint" (optional, revealed after 5+ failed guesses)

**User Interaction**: 
1. Child drags an example card to Mori's mouth
2. Mori processes and gives binary feedback
3. Card animates to appropriate pile
4. Child repeats until ready to guess

**Technical Requirements**:
- Drag-and-drop library (react-dnd or @dnd-kit/core)
- Touch-friendly drag with visual feedback (card follows finger/cursor)
- Drop zone detection on Mori's mouth area
- Animated transitions for cards moving to result piles
- Sound effects for match/no-match feedback
- State tracking for which examples have been tested

### Step 4: Guess the Rule
**Purpose**: Child attempts to articulate what pattern Mori learned.

- **Heading**: "What's Mori's secret rule?"
- **Summary Display**: Show the two piles side by side
  - "Matches!" pile with all matching examples
  - "Doesn't Match" pile with all non-matching examples
- **Input Methods**:
  - "Press and speak" button for voice input
  - Text input field as fallback
  - Placeholder text: "The rule is..."
- **Example Prompts**: Show 2-3 example guesses for first-time players
  - "Things that are red"
  - "Animals with four legs"
  - "Words that start with B"
- **Mori's Encouragement**: "Look at what matches and what doesn't. What do they have in common?"
- **Action Button**: "Check my guess!"

**Technical Requirements**:
- Speech-to-text for voice input (reuse existing speech hook)
- Text input with keyboard support
- NLP/semantic matching to evaluate if guess is correct
  - Should match meaning, not exact wording (e.g., "red things" = "things that are red")
  - Use embedding similarity or keyword matching
- Handle edge cases: partial matches, close guesses

### Step 5: Feedback - Correct Guess
**Purpose**: Celebrate success and explain how AI pattern matching works.

- **Heading**: "You got it!"
- **Celebration**: Confetti animation, Mori doing happy dance
- **Rule Reveal**: "Mori's rule was: [RULE]"
- **Explanation Panel**: "How Mori Found the Pattern"
  - Show visual breakdown: "Mori noticed that [CAT, DOG, HORSE] all have..."
  - Highlight the common feature(s) that define the pattern
  - Connect back to brain visualization: "This is how AI learns - by finding what's the same!"
- **Stats Display**:
  - "You tested X examples"
  - "You got it in Y guesses"
- **Action Buttons**:
  - "Try a harder rule!" (primary)
  - "I'm done for now" (secondary)

**User Interaction**: Child can review the explanation, then choose to continue or exit.

**Technical Requirements**:
- Celebration animation (confetti, Mori dance)
- Dynamic explanation text based on the specific rule
- Track and display attempt statistics
- Difficulty progression logic for next rule

### Step 5b: Feedback - Incorrect Guess
**Purpose**: Encourage retry with helpful hints.

- **Mori's Response**: Gentle shake animation, thoughtful expression
- **Feedback Text**: "Not quite! Let's think about this..."
- **Hint System** (progressive):
  - **1st wrong guess**: "Look more closely at the [Matches] pile. What do they have in common?"
  - **2nd wrong guess**: "Try thinking about [category hint: color/size/type/sound]"
  - **3rd+ wrong guess**: "Here's a big hint: Think about [specific hint]"
- **Action**: Return to feeding interface or guess again
- **Show Hint Button**: Becomes visible after 3 wrong guesses

**Technical Requirements**:
- Track guess attempts per rule
- Progressive hint system based on attempt count
- Semantic matching with partial credit detection ("close" vs "wrong")

### Step 6: Difficulty Progression
**Purpose**: Keep gameplay engaging with increasingly complex rules.

**Rule Difficulty Tiers**:

**Level 1 - Simple Categories** (Beginner):
- "Things that are red"
- "Animals"
- "Things you can eat"
- "Things that are round"

**Level 2 - Patterns** (Intermediate):
- "Words that start with the letter B"
- "Things that come in pairs"
- "Rhyming words"
- "Things bigger than a cat"

**Level 3 - Logical Rules** (Advanced):
- "Animals that can fly"
- "Things that are alive AND can move"
- "Fruits OR vegetables"
- "Things you find in a kitchen but not a bedroom"

**Progression Logic**:
- Start at Level 1
- After 2 correct guesses at current level, unlock next level
- Children can choose to replay any unlocked level
- Track highest level achieved

### Step 7: Session Summary (Optional Exit)
**Purpose**: Wrap up play session with progress summary.

- **Heading**: "Great job, pattern detective!"
- **Session Stats**:
  - Rules solved this session: X
  - Total rules solved: Y
  - Highest difficulty reached: Level Z
- **Mori's Closing**: "You're getting really good at finding patterns, just like an AI!"
- **Learning Recap**: "Remember: AI learns by looking at lots of examples and finding what's the same. You did the same thing today!"
- **Action Buttons**:
  - "Play more" (returns to feeding interface with new rule)
  - "Back to activities" (returns to activity hub)

## Functional Requirements

### 1. App Reorganization for Multiple Activities

1.1. The app must implement a linear curriculum system where Activity 2 is locked until Activity 1 is completed

1.2. The app must track activity completion status in localStorage or persistent storage

1.3. The app must reorganize activity components into activity-specific folders:
   - `components/activities/zhorai/` - Ecosystem learning activity components
   - `components/activities/mori/` - Pattern learning activity components
   - `components/activities/shared/` - Shared components (speech input, progress bar, etc.)

1.4. The app must create activity-agnostic context/state management that can be extended for new activities

1.5. The app must display locked activities with a lock icon and "Complete [Previous Activity] to unlock" message

### 2. Character & Brain Visualization

2.1. The app must display Mori character with animated expressions (happy, thinking, confused, excited)

2.2. The app must render an interactive brain visualization showing pattern-matching regions

2.3. Brain regions must light up and animate when tapped/clicked

2.4. Mori must have a distinct voice (different from Zhorai) for text-to-speech responses

### 3. Drag-and-Drop Feeding System

3.1. The app must display 8-12 draggable example cards per rule

3.2. Example cards must be touch-friendly (minimum 60x60pt drag targets)

3.3. Mori's mouth must act as a valid drop zone with visual hover state

3.4. Cards must animate smoothly from Mori to the appropriate result pile

3.5. The app must provide audio and visual feedback for match vs. no-match

3.6. The app must prevent re-testing the same example twice

3.7. The app must track which examples have been tested and display progress

### 4. Rule System & Content

4.1. The app must support three difficulty levels of rules:
   - Level 1: Simple categories (colors, types, basic properties)
   - Level 2: Patterns (letter patterns, rhymes, comparisons)
   - Level 3: Logical rules (AND/OR conditions, context-based)

4.2. Each difficulty level must have at least 5 unique rules

4.3. Rules must not repeat within a single play session (until exhausted)

4.4. Each rule must have a curated set of examples (4-6 matches, 4-6 non-matches)

4.5. Example images must be child-friendly and clearly represent the concept

### 5. Guess Evaluation

5.1. The app must accept voice input for guesses (reuse existing speech recognition)

5.2. The app must accept text input as fallback

5.3. The app must use semantic matching to evaluate guesses:
   - Exact match: "red things" and the rule is "things that are red"
   - Semantic match: "stuff that's red" should match "things that are red"
   - Partial match: Recognize close guesses and provide targeted feedback

5.4. The app must provide progressive hints after failed guesses

5.5. The app must not penalize minor grammar/spelling differences

### 6. Progress & Difficulty Progression

6.1. The app must track rules solved per session

6.2. The app must track total rules solved across all sessions

6.3. The app must unlock higher difficulty levels after 2 successful solves at current level

6.4. The app must save progress to localStorage

6.5. The app must allow children to continue playing indefinitely (no forced end)

### 7. Explanation & Learning Reinforcement

7.1. After each correct guess, the app must display a "How Mori Found the Pattern" explanation

7.2. The explanation must visually highlight the common features of matching examples

7.3. The explanation must connect the activity to real AI pattern recognition

7.4. The app must provide a session summary when the child chooses to exit

## Non-Goals (Out of Scope)

1. **No Custom Rule Creation**: Children cannot create their own rules for this version
2. **No Multiplayer**: Single-player experience only
3. **No Timed Challenges**: No time pressure—children can take as long as needed
4. **No External Image Upload**: All example images are pre-curated
5. **No Complex Logic**: Rules won't use NOT conditions or complex boolean logic in Level 3
6. **No Adaptive Difficulty**: Difficulty progression is fixed (2 solves per level), not dynamically adjusted based on performance

## Design Considerations

### Visual Design
- **Mori Character**: Red fuzzy monster with yellow horns, big smile with buck teeth, curly tail with star
- **Color Scheme**: 
  - Primary: Warm red-orange tones (matching Mori)
  - Match feedback: Green (#4CAF50)
  - No-match feedback: Orange/red (#FF6B6B)
  - Background: Warm cream or soft gradient
- **Brain Visualization**: Stylized, friendly (not anatomical), with glowing neural pathways
- **Cards**: Rounded corners, subtle shadows, clear illustrations with word labels

### Animation & Feedback
- **Mori Expressions**: Smooth transitions between emotional states
- **Drag Feedback**: Card lifts and follows cursor/finger with slight rotation
- **Drop Animation**: Satisfying "gulp" animation when Mori "eats" the example
- **Result Animation**: Card flies in arc to result pile with bounce
- **Celebration**: Confetti burst, Mori jump/dance animation

### Audio
- **Mori's Voice**: Distinct from Zhorai—perhaps higher-pitched, more playful
- **Sound Effects**:
  - Drag start: Soft pickup sound
  - Drop/gulp: Satisfying chomp sound
  - Match: Happy chime
  - No match: Gentle "hmm" sound
  - Correct guess: Celebration fanfare
  - Wrong guess: Encouraging "try again" tone

### Responsive Design
- Must work on iPad (landscape and portrait) and iPhone (portrait)
- Touch targets minimum 44x44pt, drag targets minimum 60x60pt
- Cards should resize based on screen size (fewer visible on phone, more on tablet)

## Technical Considerations

### Drag-and-Drop Implementation
- **Recommended**: `@dnd-kit/core` for React—excellent touch support, accessibility
- **Alternative**: `react-beautiful-dnd` or native HTML5 drag-drop with touch polyfill
- Must support both mouse and touch input seamlessly

### Rule Matching / NLP
- **Approach 1**: Keyword + synonym matching (simpler, faster)
  - Define keywords for each rule: "red" → ["red", "crimson", "scarlet"]
  - Check if user guess contains required keywords
- **Approach 2**: Embedding similarity (more flexible)
  - Use existing word embeddings from Zhorai activity
  - Compare semantic similarity between guess and rule description
- **Recommendation**: Start with keyword matching; add embedding similarity for edge cases

### Content Management
- Store rules and examples in structured JSON:
```typescript
interface Rule {
  id: string;
  level: 1 | 2 | 3;
  description: string; // "Things that are red"
  keywords: string[]; // ["red", "crimson"]
  explanation: string; // "These all share the color red!"
  examples: Example[];
}

interface Example {
  id: string;
  label: string;
  imageUrl: string;
  matches: boolean;
}
```

### State Management
- Create `MoriActivityContext` separate from Zhorai's context
- Share common utilities (speech, progress tracking) via shared hooks
- Consider creating `ActivityProgressContext` for cross-activity state (what's unlocked, total progress)

### Code Organization
```
components/
  activities/
    shared/
      progress-bar.tsx
      speech-input.tsx
      celebration-animation.tsx
    zhorai/
      (move existing activity components here)
    mori/
      introduction-step.tsx
      brain-visualization.tsx
      feeding-interface.tsx
      guess-input.tsx
      feedback-display.tsx
      session-summary.tsx

lib/
  context/
    activity-progress-context.tsx  // NEW: tracks which activities are unlocked
    zhorai-activity-context.tsx    // RENAMED from activity-context.tsx
    mori-activity-context.tsx      // NEW

lib/
  data/
    mori-rules.ts  // Rule definitions and examples
```

## Success Metrics

1. **Completion Rate**: ≥60% of children who start a round successfully guess the rule
2. **Engagement**: Average of 3+ rules attempted per session
3. **Progression**: ≥50% of players unlock Level 2 within first 3 sessions
4. **Learning Transfer**: Children can explain "AI learns from patterns" when asked
5. **Replayability**: ≥40% of children return to play additional sessions
6. **Fun Factor**: ≥4.0/5.0 rating if feedback is collected

## Open Questions

1. **Rule Content**: Need to finalize the full list of 15+ rules across all difficulty levels with curated example sets. Should we create a separate content document?

2. **Semantic Matching Accuracy**: How flexible should guess matching be? Should "animals" match "creatures" or "living things"?

3. **Hint System Depth**: Should hints eventually give away the answer, or always require the child to make the connection?

4. **Visual Assets**: Do we need to commission custom illustrations for example cards, or use existing icon libraries?

5. **Voice for Mori**: Should we use a different TTS voice, or record custom audio clips for Mori?

6. **Accessibility**: How do we make drag-and-drop accessible for screen readers or motor impairments? Consider alternative input methods.

7. **Localization**: Same question as Activity 1—English only for now, or plan for multilingual?

---

**PRD Version**: 1.0  
**Created**: January 19, 2026  
**Author**: AI Assistant  
**Status**: Draft - Pending Review  
**Depends On**: 0001-prd-ecosystem-learning-activity.md (Activity 1 must be completed first)

