# PRD: Ecosystem Learning Activity with Zhorai

## Introduction/Overview

This feature is the first step-by-step interactive activity in an AI literacy app designed for kids ages 8-10. The activity teaches children about ecosystems while simultaneously helping them understand how AI learns. Through voice interaction with Zhorai (a cute conversational character), students teach the character about animals, plants, and their relationships in ecosystems. As children teach Zhorai, they see visual representations of the character's growing understanding, making abstract AI concepts tangible and engaging.

The activity solves two key problems:
1. **AI Literacy Gap**: Children growing up in an AI-powered world lack fundamental understanding of how these systems work
2. **Engagement Challenge**: Traditional learning about AI can be passive; this activity makes students active teachers, deepening their understanding through explanation

## Goals

1. Enable children ages 8-10 to understand how AI learns by teaching Zhorai about different ecosystems through voice interaction
2. Provide immediate visual feedback showing how Zhorai's "understanding" grows as it learns from the user
3. Verify student comprehension through integrated check-for-understanding moments
4. Create an intuitive, mobile-friendly interface that works seamlessly on iPad and iPhone
5. Complete the activity within 15-20 minutes to maintain engagement for target age group
6. Introduce foundational AI literacy concepts (training, learning from examples) implicitly through the teaching experience

## User Stories

1. **As a student**, I want to speak naturally to Zhorai so that I can teach it about ecosystems without typing
2. **As a student**, I want to see Zhorai's knowledge grow visually as a mindmap so that I understand how it's learning from what I say
3. **As a student**, I want Zhorai to respond to me with voice and text so that it feels like a real conversation
4. **As a student**, I want to be asked questions during the activity so that I can check if I really understand ecosystems
5. **As a student**, I want to see my progress in the activity and clear guidance on what to do next so that I don't get lost or confused
6. **As a teacher/parent**, I want the activity to work reliably on iPad and iPhone so that students can use their preferred device
7. **As a teacher/parent**, I want the activity to validate learning so that I know students understood the core concepts

## Activity Sequence

This section defines the exact step-by-step flow of the activity, with references to Figma screens.

### Step 1: Ask Zhorai About Ecosystems
**Screen**: [Desktop - 4](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-163)

After the user clicks "Continue" from the introduction screen, they see:
- **Heading**: "Start by asking Zhorai about your favorite ecosystem."
- **Ecosystem Options Listed**: Desert, Ocean, Rainforest, Grassland, Tundra
- **Action Button**: "Press and speak" (black button)
- **Example Prompt Shown**: "What do you know about the desert?" (in purple text)

**User Interaction**: User presses the "Press and speak" button and asks Zhorai about one of the listed ecosystems using voice input.

**Technical Requirements**:
- Speech-to-text must capture the user's question
- System must identify which ecosystem the user is asking about (Desert, Ocean, Rainforest, Grassland, or Tundra)
- If ecosystem is unclear, prompt user to choose from the list

### Step 2: Zhorai Responds with Knowledge Visualization
**Screen**: [Desktop - 8](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-198)

Zhorai responds with its existing knowledge:
- **Zhorai's Message**: "I've heard so much about deserts before! Here's a visualization of my brain:"
- **Mindmap Visualization**: Interactive mindmap showing Zhorai's pre-existing knowledge (e.g., nodes for "sand," "plants" with different colors indicating quantity - blue for "lots of," orange for "little of")
- **Instruction Text**: "Hover over the circles to see what sentences I learned that correspond with each word."
- **Hover Tooltip Example**: When hovering over "sand," shows "The desert has lots of sand" (in purple text)
- **Action Buttons**: 
  - "Continue" (primary black button)
  - "Try another ecosystem" (secondary outlined button)
- **Zhorai Character**: Visible on screen

**User Interaction**: User explores the mindmap by hovering over nodes to see what Zhorai already knows, then clicks "Continue."

**Technical Requirements**:
- Generate mindmap visualization based on pre-populated knowledge for each ecosystem
- Implement hover/touch interaction to display corresponding sentences
- Mindmap should use color coding: blue circles for "lots of" something, orange/red circles for "little of" something
- Node sizes should vary based on concept importance or frequency

### Step 3: Check for Understanding
**Screen**: [Desktop - 9](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-235)

Before teaching begins, a comprehension check:
- **Mindmap Still Visible**: Condensed view of the previous mindmap with key nodes (e.g., "plants" in orange, "sand" in blue)
- **Question**: "Take a look at each circle."
- **Main Question Box**: "What do you notice about the words and colors of each circle?"
- **Multiple Choice Options** (checkboxes):
  - "Zhorai pulled out key words from the sentences."
  - "Zhorai used blue for 'lots of' and orange for 'little of' something."
- **Submit Button**: Black button at bottom

**User Interaction**: User selects the correct answer(s) by checking boxes and clicks "Submit."

**Technical Requirements**:
- Both options should be correct (multi-select)
- Provide feedback if user misses an option
- Only advance when both correct answers are selected
- Visual feedback: Selected boxes should have purple/blue background and border

### Step 4: Choose an Animal to Teach About
**Screen**: [Desktop - 11](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=192-552)

Transition to teaching phase:
- **Context Text**: "Zhorai knows a lot about ecosystems, but hasn't met any animals before! Can you teach it about some animals?"
- **Question Box**: "Choose an animal to teach Zhorai about!"
- **Animal Options** (radio buttons):
  - Bees (shown as selected with purple background and checkmark)
  - Dolphins
  - Monkeys
  - Zebras
- **Zhorai Character**: Visible in the selection area
- **Action Button**: "Continue" (black button)
- **Zhorai's Speech Bubble**: "Can you teach me about bees?" (in purple text)

**User Interaction**: User selects one animal from the list and clicks "Continue."

**Technical Requirements**:
- Single selection (radio button behavior)
- Selected option should have purple/blue background (#F4F0FF) and purple border (#967FD8)
- Zhorai's speech bubble should update based on selected animal
- Store selected animal for rest of activity flow

### Step 5: Speak to Add Sentences About the Animal
**Screen**: [Desktop - 12](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=192-633)

Main teaching interface:
- **Heading**: "Tell Zhorai three things about bees."
- **Section Title**: "What Zhorai learned from you about bees:"
- **Action Buttons**:
  - "Press and speak to add" (primary black button with add circle icon)
  - "See Zhorai's brain" (secondary outlined button)

**User Interaction**: User presses "Press and speak to add" button and says a sentence about the animal. Process repeats until three sentences are added.

**Technical Requirements**:
- Speech-to-text captures each sentence
- Display microphone listening state (pulsing animation or visual indicator)
- Require at least 3 sentences before allowing progression
- Sentences should be informative (not just "I like bees")
- System should validate sentence quality (contains subject + predicate, relates to the animal)

### Step 6: View Added Sentences with Edit/Delete Options
**Screen**: [Desktop - 13](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=196-531)

Display captured sentences:
- **Heading**: "Tell Zhorai three things about bees."
- **Section Title**: "What Zhorai learned from you about bees:"
- **Sentence Cards**: Each sentence displayed in a rounded rectangle card
  - Example: "Bees drink nectar" (first card has purple background #F4F0FF)
  - "Queen bees lay eggs"
  - "Bees live in hives on trees"
- **Card Hover State**: Shows "Edit" and "Delete" options with icons
- **Action Buttons**:
  - "Press and speak to add" (to add more sentences)
  - "See Zhorai's brain" (to view mindmap)
- **Mouse Pointer**: Shown hovering over first card to indicate interactivity

**User Interaction**: User can hover over any sentence to edit or delete it. When satisfied with three sentences, user clicks "See Zhorai's brain."

**Technical Requirements**:
- Each sentence card should be hoverable/tappable
- Edit: Opens modal or inline edit to re-record or type correction
- Delete: Removes sentence from list
- Cards should have smooth hover/tap animations
- Minimum 3 sentences required before "See Zhorai's brain" is enabled

### Step 7: View Zhorai's Brain Mindmap
**Screen**: [Desktop - 14](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=200-1372)

Zhorai processes the sentences into a mindmap:
- **Zhorai's Message**: "Here's what I know about bees!"
- **Mindmap Visualization**: Visual representation showing extracted concepts from the user's sentences (e.g., nodes for "nectar," "queen," "eggs," "hives," "trees")
- **Section Showing Sentences**: Condensed view at bottom showing the three learned sentences
- **Action Buttons**:
  - "Press and speak to add" (to add more)
  - "See Zhorai's brain" (current view)
- **Mouse Pointer**: Indicating interactivity
- **Zhorai Character**: Visible on right side

**User Interaction**: User explores the mindmap to see how Zhorai extracted key concepts from their sentences. User can continue to add more sentences or proceed to next step.

**Technical Requirements**:
- ML model extracts key nouns, verbs, and relationships from user sentences
- Generate mindmap with nodes representing concepts
- Node connections should show relationships (e.g., "bees" → "drink" → "nectar")
- Nodes should be color-coded or sized based on concept type or importance
- Smooth animation when mindmap appears
- Allow zooming/panning for larger mindmaps

### Step 8: Ask Zhorai to Predict Using ML
**Screen**: [Desktop - 15](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=200-1591)

Final prediction challenge:
- **Heading**: "Do you think Zhorai can guess where bees live? Try asking!"
- **Action Button**: "Press and speak"
- **Example Question**: "Where do bees live?" (in purple text)
- **Visualization Box**: Shows bar chart with probabilities for each ecosystem
  - Instruction: "Hover over the bars to see what sentences I learned that correspond with each ecosystem."
  - Zhorai's Response: "I think bees live in rainforests" (based on calculated probabilities)
- **Bar Chart**: Shows relative probabilities for Desert, Ocean, Rainforest, Grassland, Tundra
  - Bars have different heights based on ML model's confidence
  - Hovering over bars shows relevant sentences that influenced the prediction
- **Zhorai Character**: Visible on right side

**User Interaction**: User asks Zhorai where the animal lives. Zhorai uses a basic ML model to calculate probabilities and visualize the answer.

**Technical Requirements**:
- **ML Prediction Model**: Analyze the user's sentences and Zhorai's existing ecosystem knowledge to calculate probability distribution
- **Algorithm Approach**: 
  - Extract habitat clues from user sentences (keywords like "trees," "water," "hot," "cold")
  - Match against ecosystem characteristics in knowledge base
  - Calculate confidence scores for each ecosystem
  - Normalize to probabilities (sum to 100%)
- **Visualization**: Horizontal or vertical bar chart showing probabilities
- **Hover/Touch Interaction**: Display which specific sentences influenced each ecosystem probability
- **Response Generation**: Zhorai states the most likely ecosystem with appropriate confidence language ("I think," "I'm pretty sure," "Maybe")
- **Edge Cases**: Handle cases where prediction is uncertain (multiple ecosystems with similar probabilities)

## Functional Requirements

### 1. Activity Flow & Navigation

1.1. The app must display an introduction screen (per Figma) showing Zhorai, activity title "How machine learns with Zhorai", description, and two action buttons: "Continue" and "Test your microphone"

1.2. The app must provide a "Test your microphone" function that allows users to verify audio input is working before starting the activity

1.3. The app must implement a step-by-step guided introduction that explains the teaching process, followed by a semi-free exploration phase where students can teach different ecosystem concepts

1.4. The app must show a progress indicator (e.g., gray bars that become purple as user progresses through activity) indicating which step of the activity the user is on

1.5. The app must provide Previous/Next navigation buttons (per Figma) to move between activity steps

1.6. The app must include a close/exit button (X icon in Figma) that allows users to exit the activity

### 2. Audio Input System

2.1. The app must request microphone permissions from the user before the activity begins

2.2. The app must use speech-to-text transcription to convert user voice input into text

2.3. The app must provide visual feedback when the microphone is actively listening (e.g., pulsing animation, waveform)

2.4. The app must handle cases where speech is unclear or not detected, prompting the user to try again

2.5. The app must support continuous conversation mode where users can speak multiple times without re-enabling the microphone

### 3. Machine Learning Model & Knowledge Visualization

3.1. The app must use a basic ML model to analyze transcribed speech and extract key ecosystem concepts (animals, plants, relationships, habitats)

3.2. The app must visualize Zhorai's growing understanding through a visual metaphor (e.g., knowledge meter, growing tree, expanding web of connections)

3.3. The visualization must update in real-time (within 2 seconds) after the user teaches Zhorai something new

3.4. The app must track what concepts Zhorai has learned and prevent redundant teaching of the same concept

3.5. The app must display Zhorai's current knowledge state in a way that's understandable to 8-10 year olds

### 4. Audio Output & Character Responses

4.1. The app must have Zhorai respond to user teachings with a mix of pre-recorded voice lines (for common responses) and AI-generated text-to-speech (for dynamic responses)

4.2. Zhorai's responses must include:
   - Acknowledgment of what the user taught ("Oh, so foxes eat rabbits!")
   - Follow-up questions to encourage deeper thinking ("What do rabbits eat?")
   - Expressions of confusion when something is unclear ("Hmm, I'm not sure I understand")
   - Excitement when learning new concepts ("Wow! I didn't know that!")

4.3. All audio responses must be accompanied by synchronized text captions for accessibility

4.4. The app must allow users to replay Zhorai's last response if they missed it

### 5. Checks for Understanding

5.1. The app must integrate 3-5 check-for-understanding moments throughout the activity that combine:
   - Multiple choice questions (can be answered via voice or touch)
   - Explanation challenges ("Can you explain to Zhorai what happens if...")
   - Interactive scenarios ("Show Zhorai what would happen if all the plants disappeared")

5.2. The app must provide immediate feedback on check responses:
   - Correct answers: Positive reinforcement + brief explanation
   - Incorrect answers: Gentle correction + opportunity to try again

5.3. The app must require students to answer check questions correctly before proceeding to the next major section

5.4. The app must track check-for-understanding results to measure student comprehension

### 6. Teaching Companion Character (Zhorai)

6.1. Zhorai must act as a teaching companion that:
   - Guides users through the activity with clear prompts
   - Asks clarifying questions when needed
   - Provides hints when students seem stuck
   - Celebrates progress and milestones

6.2. Zhorai must have a consistent personality: curious, friendly, encouraging, and occasionally playful

6.3. The app must display Zhorai with animated expressions that match the conversation context (happy when learning, confused when uncertain, excited when discovering something new)

### 7. Success Criteria & Completion

7.1. The app must consider the activity successful when:
   - The user completes all mandatory steps in the activity
   - The user correctly answers all check-for-understanding questions (may retry)
   - Zhorai has "learned" at least 5 core ecosystem concepts

7.2. The app must display a completion screen showing:
   - What Zhorai learned
   - How well the user did on checks
   - Encouragement to continue to the next activity

7.3. The app must unlock the next activity in the sequence upon successful completion

## Non-Goals (Out of Scope)

1. **No User Accounts/Authentication**: First version will not include login, user profiles, or saved progress across devices
2. **No Multiplayer**: Students work individually with Zhorai; no collaborative or competitive features
3. **No Advanced Scientific Accuracy**: Ecosystem concepts are simplified for ages 8-10; not designed for advanced biology study
4. **No Offline Mode**: Activity requires internet connection for ML model and speech processing
5. **No Content Creation Tools**: Students cannot create custom activities or modify Zhorai's teaching content

## Design Considerations

### Visual Design Reference
- Base design on Figma file: [Ai literacy for kids - Desktop 3](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-133)
- Character: Zhorai (cute character shown in Figma with purple/blue tones)
- Color scheme: Clean white background (#FFFFFF), black text (#000000), accent color purple/blue from Zhorai
- Typography: Inter font family (400 weight for body, 600 weight for headings)
- Button styles: Primary filled (black bg, white text), Secondary outlined (white bg, black text, black border)

### Responsive Design
- Must adapt layouts for iPad (landscape and portrait) and iPhone (portrait primarily)
- Touch targets must be at least 44x44pt for easy tapping
- Text must be readable at arm's length for tablet usage

### Animation & Feedback
- Microphone listening state: subtle pulsing animation
- Zhorai expressions: smooth transitions between emotional states
- Knowledge visualization: smooth, delightful animations when adding new concepts
- Button interactions: clear pressed states

## Technical Considerations

### Speech Processing
- **Speech-to-Text**: Use Web Speech API (Chrome on iPad/iPhone) or integrate cloud service (e.g., Google Cloud Speech-to-Text, Azure Speech)
- **Recommendation**: Implement client-side first with Web Speech API for lower latency; fallback to cloud service if needed

### Machine Learning Model
- **Concept Extraction**: Use simple NLP model (keyword extraction + entity recognition) to identify ecosystem concepts
- **Suggestion**: Could use lightweight model like spaCy.js or simple regex patterns for first version; iterate to more sophisticated models later
- **Knowledge Base**: Maintain a structured dataset of ecosystem concepts, relationships, and taxonomies that the model can match against

### Text-to-Speech
- **Pre-recorded Audio**: Record ~50-100 most common Zhorai response phrases for natural, high-quality audio
- **Dynamic TTS**: Use Web Speech API SpeechSynthesis or cloud TTS (e.g., Google Cloud TTS with child-friendly voices) for dynamic responses
- **Audio Format**: MP3 or AAC for pre-recorded files

### Performance
- **Response Time**: ML processing + visualization update must complete within 2 seconds of user finishing speech
- **Audio Latency**: Aim for <500ms between user finishing speech and Zhorai starting response
- **Animation Frame Rate**: Maintain 60fps for all animations

### Platform Compatibility
- **iOS/iPadOS**: Test on iOS 15+ and iPadOS 15+ (covers ~95% of active devices)
- **Browsers**: Optimize for Safari (primary browser on iOS/iPadOS)
- **Device Testing**: Test on iPhone SE (small screen), iPhone 14 Pro (standard), iPad Air (medium tablet), iPad Pro 12.9" (large tablet)

### Framework Recommendations
- **Web App**: React or Next.js with responsive design
- **Native App**: React Native or Swift/SwiftUI if native performance needed
- **Audio**: Howler.js for audio playback management
- **Animation**: Framer Motion or Lottie for character animations

## Success Metrics

1. **Completion Rate**: ≥70% of students who start the activity complete it successfully
2. **Comprehension**: ≥80% of students answer check-for-understanding questions correctly (after retries)
3. **Engagement Time**: Average activity duration between 12-20 minutes (indicates full engagement without rushing or abandoning)
4. **Audio Quality**: <5% of sessions require microphone troubleshooting or have speech recognition failures
5. **User Satisfaction**: ≥4.0/5.0 rating from students (if feedback collected)
6. **Learning Outcome**: Students can explain at least 3 ecosystem concepts after completing the activity (via post-activity assessment)

## Open Questions

1. **ML Model Complexity**: Should the initial version use a simple keyword-matching approach or invest in training/fine-tuning a more sophisticated NLP model? Trade-off between development time and accuracy.

2. **Error Handling**: How should the app handle persistent speech recognition issues? Should there be a text input fallback?

3. **Content Scope**: The activity sequence specifies teaching 3 sentences about one animal. Should there be a follow-up activity for additional animals, or is one animal sufficient for the first lesson?

4. **Accessibility**: Beyond captions, what additional accessibility features should be prioritized? (e.g., adjustable text size, high contrast mode, screen reader support)

5. **Analytics**: What specific user interaction data should be captured for product improvement while respecting children's privacy (COPPA compliance)?

6. **Languages**: Is English-only sufficient for initial launch, or should we plan for multilingual support from the start?

7. **Pre-populated Knowledge**: What specific sentences/facts should be pre-loaded into Zhorai's knowledge base for each of the five ecosystems (Desert, Ocean, Rainforest, Grassland, Tundra)?

---

**PRD Version**: 1.0  
**Created**: October 11, 2025  
**Author**: AI Assistant  
**Status**: Draft - Pending Review

