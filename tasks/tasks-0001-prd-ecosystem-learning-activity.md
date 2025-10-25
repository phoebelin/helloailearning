# Task List: Ecosystem Learning Activity with Zhorai

**Source PRD**: `0001-prd-ecosystem-learning-activity.md`

## Current State Assessment

The codebase is a Next.js application with:
- Existing lesson infrastructure (`LessonLayout`, `LessonNav` components)
- Basic UI components (Button, Input, Select from shadcn/ui)
- A placeholder lesson page at `/app/lessons/how-machines-learn/page.tsx`
- Styling with Tailwind CSS
- Uses Inter font for typography (per Figma specs)

The existing `LessonLayout` component provides step navigation functionality that can be leveraged for the 8-step activity flow.

## Testing Strategy

**Each parent task (2.0-7.0) includes testing subtasks** to enable incremental validation:
- Write unit/component tests for new code
- Create temporary test pages for manual verification
- After all subtasks in a parent task are complete, run the test suite
- If tests pass, commit changes with descriptive message
- Task 8.0 is reserved for comprehensive final testing across all features

This approach allows us to catch issues early and ensure each module works before building on top of it.

## Figma Design References

All screens reference: [Figma - Ai literacy for kids](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids)

- **Introduction Screen**: [Desktop - 3](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-133)
- **Step 1 - Ecosystem Selection**: [Desktop - 4](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-163)
- **Step 2 - Knowledge Visualization**: [Desktop - 8](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-198)
- **Step 3 - Understanding Check**: [Desktop - 9](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=38-235)
  - **Bottom Nav Pattern**: [Desktop - 9 Nav](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/AI-literacy-for-kids?node-id=503-698&t=vRSfo3enqjpEemkx-4)
  - **Success State**: [Desktop - 9 Success](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/AI-literacy-for-kids?node-id=504-782&t=vRSfo3enqjpEemkx-4)
  - **Why Explanation**: [Desktop - 9 Why](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/AI-literacy-for-kids?node-id=505-864&t=vRSfo3enqjpEemkx-4)
  - **Error State**: [Desktop - 9 Error](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/AI-literacy-for-kids?node-id=505-922&t=vRSfo3enqjpEemkx-4)
- **Step 4 - Animal Selection**: [Desktop - 11](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=192-552)
- **Step 5 - Sentence Input**: [Desktop - 12](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=192-633)
- **Step 6 - Sentence List**: [Desktop - 13](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=196-531)
- **Step 7 - Mindmap Display**: [Desktop - 14](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=200-1372)
- **Step 8 - Prediction**: [Desktop - 15](https://www.figma.com/design/XP8JMtQI4NCvdxls3dfEJu/Ai-literacy-for-kids?node-id=200-1591)

**Design Specs**:
- Color scheme: White background (#FFFFFF), black text (#000000), purple accent (#967FD8), light purple background (#F4F0FF)
- Typography: Inter font (400 for body, 600 for headings)
- Buttons: Primary (black bg, white text), Secondary (outlined, white bg, black text/border)
- Touch targets: Minimum 44x44pt

## Relevant Files

### New Files to Create
- `types/activity.ts` - TypeScript type definitions for all activity data structures (CREATED)
- `lib/data/ecosystem-knowledge.ts` - Pre-populated knowledge base with facts and mindmaps for all 5 ecosystems (CREATED)
- `lib/data/animal-data.ts` - Animal options with habitat keywords and ecosystem affinity scores (CREATED)
- `lib/context/activity-context.tsx` - React Context for global activity state management (CREATED)
- `lib/utils/validation.ts` - Sentence quality validation utilities (CREATED)
- `components/activity/microphone-permission-dialog.tsx` - Permission request dialog with browser-specific instructions (CREATED)
- `components/activity/speech-fallback.tsx` - Fallback text input components for unsupported browsers (CREATED)
- `app/test-speech/page.tsx` - TEMPORARY test page for manual verification of speech features (CREATED - DELETE BEFORE PRODUCTION)
- `app/lessons/how-machines-learn/ecosystem-activity/page.tsx` - Main activity page component
- `components/activity/introduction-step.tsx` - Step 0 (Figma: Desktop-3): Introduction with Zhorai, Test Microphone (CREATED)
- `components/activity/ecosystem-selection-step.tsx` - Step 1 (Figma: Desktop-4): Ecosystem selection via speech or click (CREATED)
- `components/activity/knowledge-visualization-step.tsx` - Step 2 (Figma: Desktop-8): Zhorai's pre-existing knowledge mindmap (CREATED)
- `components/activity/understanding-check-step.tsx` - Step 3 (Figma: Desktop-9): Comprehension check with checkboxes (CREATED)
- `components/activity/animal-selection-step.tsx` - Step 4 (Figma: Desktop-11): Choose animal to teach (Bees/Dolphins/Monkeys/Zebras) (CREATED)
- `components/activity/sentence-input-step.tsx` - Step 5 (Figma: Desktop-12): Add sentences about animal via speech (CREATED)
- `components/activity/sentence-list-step.tsx` - Step 6 (Figma: Desktop-13): View/edit/delete sentences with cards (CREATED)
- `components/activity/mindmap-display-step.tsx` - Step 7 (Figma: Desktop-14): User-taught concepts in mindmap
- `components/activity/prediction-step.tsx` - Step 8 (Figma: Desktop-15): ML ecosystem prediction with bar chart
- `components/activity/zhorai-character.tsx` - Animated Zhorai character component
- `components/activity/mindmap-visualization.tsx` - Interactive mindmap visualization component
- `components/activity/probability-chart.tsx` - Bar chart for ecosystem predictions
- `components/activity/audio-recorder.tsx` - Reusable speech-to-text component (CREATED)
- `hooks/use-speech-recognition.ts` - Custom hook for Web Speech API (CREATED)
- `hooks/use-text-to-speech.ts` - Custom hook for text-to-speech functionality (CREATED)
- `lib/ml/concept-extractor.ts` - ML model for extracting concepts from text
- `lib/ml/ecosystem-predictor.ts` - ML model for predicting ecosystems
- `lib/data/ecosystem-knowledge.ts` - Pre-populated knowledge base for ecosystems
- `lib/data/animal-data.ts` - Animal options and related data
- `lib/utils/speech-utils.ts` - Utility functions for speech processing (CREATED)
- `lib/utils/validation.ts` - Sentence validation utilities
- `types/activity.ts` - TypeScript types for activity data structures

### Existing Files to Modify
- `components/lesson-layout.tsx` - May need enhancement for activity-specific features
- `app/lessons/how-machines-learn/page.tsx` - Update to link to new activity

### Test Files
- `hooks/__tests__/use-speech-recognition.test.ts` - Unit tests for speech recognition hook (CREATED)
- `hooks/__tests__/use-text-to-speech.test.ts` - Unit tests for text-to-speech hook (CREATED)
- `jest.config.js` - Jest configuration for Next.js (CREATED)
- `jest.setup.js` - Jest setup file with global mocks (CREATED)
- `components/activity/__tests__/ecosystem-selection-step.test.tsx` - Component tests for Step 1 (CREATED)
- `components/activity/__tests__/understanding-check-step.test.tsx` - Component tests for Step 3 (CREATED)
- `components/activity/__tests__/animal-selection-step.test.tsx` - Component tests for Step 4 (CREATED)
- `components/activity/__tests__/audio-recorder.test.tsx`
- `lib/ml/__tests__/concept-extractor.test.ts`
- `lib/ml/__tests__/ecosystem-predictor.test.ts`

### Notes
- Run `npm install` to install test dependencies (Jest, @testing-library/react, @testing-library/jest-dom)
- Unit tests should be placed in `__tests__` directories within each module
- Use `npm test` to run tests, `npm run test:watch` for watch mode, `npm run test:coverage` for coverage reports
- **Manual Testing**: Visit `http://localhost:3000/test-speech` during development to test speech features in browser
- Follow existing patterns from `LessonLayout` and `LessonNav` for navigation
- Ensure all components are responsive for iPad and iPhone

## Tasks

- [x] 1.0 Set up project infrastructure and data models
  - [x] 1.1 Create `types/activity.ts` with TypeScript interfaces for Activity, Step, Ecosystem, Animal, Sentence, MindmapNode, PredictionResult
  - [x] 1.2 Create `lib/data/ecosystem-knowledge.ts` with pre-populated knowledge base containing facts for all 5 ecosystems (Desert, Ocean, Rainforest, Grassland, Tundra) with associated sentences and color-coded concepts
  - [x] 1.3 Create `lib/data/animal-data.ts` with animal options (Bees, Dolphins, Monkeys, Zebras) and their habitat characteristics
  - [x] 1.4 Set up activity state management structure (consider using React Context or Zustand for global activity state)
  - [x] 1.5 Create `lib/utils/validation.ts` with functions to validate sentence quality (contains subject/predicate, relates to selected animal, minimum word count)

- [x] 2.0 Implement speech recognition and audio system
  - [x] 2.1 Create `hooks/use-speech-recognition.ts` custom hook implementing Web Speech API with start/stop recording, transcript state, error handling, and browser compatibility checks
  - [x] 2.2 Create `hooks/use-text-to-speech.ts` custom hook for TTS with speak/pause/stop functions, voice selection (child-friendly), and audio queue management
  - [x] 2.3 Create `components/activity/audio-recorder.tsx` reusable component with microphone button, pulsing animation for listening state, visual waveform or indicator, and transcript display
  - [x] 2.4 Implement microphone permission request flow with user-friendly error messages for denied/unavailable permissions
  - [x] 2.5 Create `lib/utils/speech-utils.ts` with utility functions for audio processing, transcript cleaning, and speech-to-text confidence scoring
  - [x] 2.6 Add fallback handling for browsers without Web Speech API support (graceful degradation message)
  - [x] 2.7 Write unit tests for speech hooks: test `use-speech-recognition` with mock Web Speech API, test `use-text-to-speech` voice selection and queue management
  - [x] 2.8 Create simple test page/component to manually verify audio recorder functionality in browser

- [ ] 3.0 Build activity step components (Steps 1-4: Setup phase)
  - [x] 3.1 Create `components/activity/introduction-step.tsx` - **Figma: Desktop-3** - Zhorai character, activity title "How machine learns with Zhorai", description, "Continue" button (black), and "Test your microphone" button
  - [x] 3.2 Create `components/activity/ecosystem-selection-step.tsx` - **Figma: Desktop-4** - Heading "Start by asking Zhorai about your favorite ecosystem", ecosystem list (Desert, Ocean, Rainforest, Grassland, Tundra), "Press and speak" button (black), example prompt "What do you know about the desert?" (purple text), speech-to-text ecosystem detection
  - [x] 3.3 Create `components/activity/knowledge-visualization-step.tsx` - **Figma: Desktop-8** - Zhorai's message "I've heard so much about deserts before! Here's a visualization of my brain:", interactive mindmap with blue circles (lots of) and orange circles (little of), hover instruction text, tooltips showing source sentences (purple text), Zhorai character visible, "Continue" (black) and "Try another ecosystem" (outlined) buttons
  - [x] 3.4 Create `components/activity/understanding-check-step.tsx` - **Figma: Desktop-9** - Condensed mindmap view at top with key nodes (dynamic based on ecosystem selected with one positive one negative node), question "Take a look at each circle", main question box "What do you notice about the words and colors of each circle?", multi-select checkboxes (both correct: "Zhorai pulled out key words" and "Zhorai used blue for 'lots of' and orange for 'little of'"), selected boxes with purple/blue background (#F4F0FF) and purple border (#967FD8), bottom navigation pattern with "Submit" button (black), success state with checkmark and "Great job!" message, "Why" button to show explanation modal with detailed reasoning, user error state with helpful feedback and retry option, feedback logic with state management
  - [x] 3.5 Create `components/activity/animal-selection-step.tsx` - **Figma: Desktop-11** - Context text "Zhorai knows a lot about ecosystems, but hasn't met any animals before! Can you teach it about some animals?", question box "Choose an animal to teach Zhorai about!", radio buttons for Bees/Dolphins/Monkeys/Zebras, selected option with purple background (#F4F0FF) and checkmark, Zhorai character in selection area, dynamic speech bubble "Can you teach me about [animal]?" (purple text), "Continue" button (black)
  - [x] 3.6 Write component tests for steps 1-4: test ecosystem selection flow, understanding check validation, and animal selection
  - [ ] 3.7 Create temporary test page to manually verify steps 1-4 navigation and functionality

- [x] 4.0 Build teaching phase components (Steps 5-6: Sentence collection)
  - [x] 4.1 Create `components/activity/sentence-input-step.tsx` - **Figma: Desktop-12** - Heading "Tell Zhorai three things about [animal]", section title "What Zhorai learned from you about [animal]:", "Press and speak to add" button (black) with add circle icon, "See Zhorai's brain" button (outlined, disabled until 3 sentences), microphone listening state with pulsing animation, sentence validation (requires subject+predicate, relates to animal), minimum 3 sentences required
  - [x] 4.2 Create `components/activity/sentence-list-step.tsx` - **Figma: Desktop-13** - Heading "Tell Zhorai three things about [animal]", section title "What Zhorai learned from you about [animal]:", sentence cards in rounded rectangles (first card has purple background #F4F0FF), hover state shows Edit and Delete icons, mouse pointer indicates interactivity, "Press and speak to add" button to add more, "See Zhorai's brain" button (enabled with 3+ sentences), edit modal for re-recording or typing correction, delete confirmation
  - [x] 4.3 Implement sentence storage in activity state with add, edit, delete, and retrieve functions
  - [x] 4.4 Add sentence validation on submission (check quality, relevance to animal, duplicate detection)
  - [x] 4.5 Create empty state UI for when no sentences have been added yet
  - [x] 4.6 Write component tests for sentence input and list steps: test add/edit/delete functionality, validation logic
  - [x] 4.7 Create temporary test page to verify sentence collection flow works end-to-end

- [ ] 5.0 Implement ML models and visualizations (Steps 7-8)
  - [x] 5.1 Create `lib/ml/concept-extractor.ts` - ML logic to extract key nouns, verbs, and relationships from user sentences (use simple keyword extraction, regex patterns, or lightweight NLP library), extract concepts like "nectar", "queen", "eggs", "hives", "trees" from sentences about animals
  - [x] 5.2 Create `components/activity/mindmap-visualization.tsx` - Reusable interactive mindmap component with nodes for concepts (size based on importance), color coding (blue for abundance, orange for scarcity), connections showing relationships (e.g., "bees" → "drink" → "nectar"), hover/touch interaction for details, smooth animations, optional zoom/pan functionality
  - [x] 5.3 Create `components/activity/mindmap-display-step.tsx` - **Figma: Desktop-14** - Zhorai's message "Here's what I know about [animal]!", mindmap visualization showing extracted concepts from user's sentences, condensed sentence list at bottom showing the learned sentences, "Press and speak to add" button to add more sentences, "See Zhorai's brain" button (current view), Zhorai character visible on right side, mouse pointer indicating interactivity
  - [ ] 5.4 Create `lib/ml/ecosystem-predictor.ts` - Prediction algorithm that extracts habitat keywords from user sentences (e.g., "trees", "water", "hot", "cold"), matches against ecosystem characteristics in knowledge base, calculates confidence scores for each ecosystem (Desert, Ocean, Rainforest, Grassland, Tundra), normalizes to probability distribution (sum to 100%)
  - [ ] 5.5 Create `components/activity/probability-chart.tsx` - Bar chart component showing probabilities for each ecosystem with different bar heights based on ML confidence, hover tooltips displaying which sentences influenced each ecosystem prediction, animated bar growth on initial render, clear labels for each ecosystem
  - [ ] 5.6 Create `components/activity/prediction-step.tsx` - **Figma: Desktop-15** - Heading "Do you think Zhorai can guess where [animal] live? Try asking!", "Press and speak" button (black), example question "Where do [animal] live?" (purple text), bar chart visualization showing probabilities for each ecosystem, hover instruction "Hover over the bars to see what sentences I learned that correspond with each ecosystem", Zhorai's response "I think [animal] live in [ecosystem]" with confidence language ("I think", "I'm pretty sure", "Maybe"), Zhorai character visible on right side
  - [ ] 5.7 Write unit tests for ML models: test `concept-extractor` with various sentences, test `ecosystem-predictor` with known input/output pairs
  - [ ] 5.8 Create temporary test page to verify mindmap visualization and prediction chart render correctly with sample data

- [ ] 6.0 Integrate all steps into activity flow
  - [ ] 6.1 Create `app/lessons/how-machines-learn/ecosystem-activity/page.tsx` as main activity page component with all 8 step components wrapped in array
  - [ ] 6.2 Integrate with existing `LessonLayout` component or create custom activity layout with step navigation, progress indicator (purple bars), Previous/Next buttons, and Close (X) button
  - [ ] 6.3 Implement activity state management across all steps with React Context provider wrapping activity page, state persistence during navigation, and step validation before proceeding
  - [ ] 6.4 Add step transition logic with validation checks (e.g., can't proceed without 3 sentences), smooth animations between steps, and disabled Previous button on first step
  - [ ] 6.5 Implement completion screen (after Step 8) showing summary of what Zhorai learned, congratulations message, and "Continue to next activity" button
  - [ ] 6.6 Update `app/lessons/how-machines-learn/page.tsx` to link to new ecosystem activity page
  - [ ] 6.7 Write integration tests for complete activity flow: test navigation between all 8 steps, state persistence, validation gates
  - [ ] 6.8 Manual browser testing: run dev server and complete full activity flow, verify all steps work correctly

- [ ] 7.0 Add animations, polish, and responsive design
  - [ ] 7.1 Create `components/activity/zhorai-character.tsx` with Zhorai SVG/image, animated expressions (happy, confused, excited), smooth transitions between states, and idle animation
  - [ ] 7.2 Implement microphone listening animation with pulsing effect on button and optional waveform visualization
  - [ ] 7.3 Add smooth animations for mindmap node appearance, sentence card hover effects, button pressed states, and step transitions
  - [ ] 7.4 Ensure all components are responsive for iPad landscape (1024x768), iPad portrait (768x1024), iPhone (375x667 minimum), using Tailwind breakpoints
  - [ ] 7.5 Implement touch-friendly interactions with 44x44pt minimum touch targets, long-press for additional options, and swipe gestures (optional)
  - [ ] 7.6 Add loading states for ML processing with spinner/skeleton and "Zhorai is thinking..." message
  - [ ] 7.7 Polish typography using Inter font (400 for body, 600 for headings) matching Figma specs
  - [ ] 7.8 Refine color scheme with purple accent (#967FD8), light purple background (#F4F0FF), black text (#000000), and white background (#FFFFFF)
  - [ ] 7.9 Responsive design testing: verify layout on different screen sizes using browser dev tools
  - [ ] 7.10 Accessibility testing: test keyboard navigation, check color contrast, verify touch target sizes

- [ ] 8.0 Final testing and quality assurance (comprehensive testing across all features)
  - [ ] 8.1 Run full test suite: ensure all unit, component, and integration tests pass
  - [ ] 8.2 Manual cross-browser testing: test on Chrome, Safari, Firefox, Edge
  - [ ] 8.3 Manual device testing: test on actual iPad Air, iPad Pro, iPhone 14, iPhone SE with Safari
  - [ ] 8.4 Test microphone permissions flow on different iOS versions (15+) and browsers
  - [ ] 8.5 Comprehensive accessibility audit: VoiceOver support, keyboard navigation, WCAG AA color contrast, focus management
  - [ ] 8.6 Performance testing: measure ML processing time (<2s target), audio latency (<500ms target), animation frame rate (60fps target)
  - [ ] 8.7 Edge case and error testing: poor speech recognition, no internet connection, browser incompatibility, permission denied, timeout handling
  - [ ] 8.8 User flow testing: complete full activity multiple times with different inputs, verify consistency
  - [ ] 8.9 Fix any bugs or issues discovered during final testing
  - [ ] 8.10 Final code review and cleanup: remove console.logs, unused imports, commented code

