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

## Relevant Files

### New Files to Create
- `types/activity.ts` - TypeScript type definitions for all activity data structures (CREATED)
- `lib/data/ecosystem-knowledge.ts` - Pre-populated knowledge base with facts and mindmaps for all 5 ecosystems (CREATED)
- `lib/data/animal-data.ts` - Animal options with habitat keywords and ecosystem affinity scores (CREATED)
- `lib/context/activity-context.tsx` - React Context for global activity state management (CREATED)
- `lib/utils/validation.ts` - Sentence quality validation utilities (CREATED)
- `app/lessons/how-machines-learn/ecosystem-activity/page.tsx` - Main activity page component
- `components/activity/introduction-step.tsx` - Step 0: Introduction screen with Continue and Test Microphone
- `components/activity/ecosystem-selection-step.tsx` - Step 1: Ask about ecosystems
- `components/activity/knowledge-visualization-step.tsx` - Step 2: Zhorai's mindmap response
- `components/activity/understanding-check-step.tsx` - Step 3: Multiple choice comprehension check
- `components/activity/animal-selection-step.tsx` - Step 4: Choose animal to teach
- `components/activity/sentence-input-step.tsx` - Step 5: Add sentences via speech
- `components/activity/sentence-list-step.tsx` - Step 6: View/edit/delete sentences
- `components/activity/mindmap-display-step.tsx` - Step 7: View Zhorai's brain mindmap
- `components/activity/prediction-step.tsx` - Step 8: ML prediction visualization
- `components/activity/zhorai-character.tsx` - Animated Zhorai character component
- `components/activity/mindmap-visualization.tsx` - Interactive mindmap visualization component
- `components/activity/probability-chart.tsx` - Bar chart for ecosystem predictions
- `components/activity/audio-recorder.tsx` - Reusable speech-to-text component
- `hooks/use-speech-recognition.ts` - Custom hook for Web Speech API
- `hooks/use-text-to-speech.ts` - Custom hook for text-to-speech functionality
- `lib/ml/concept-extractor.ts` - ML model for extracting concepts from text
- `lib/ml/ecosystem-predictor.ts` - ML model for predicting ecosystems
- `lib/data/ecosystem-knowledge.ts` - Pre-populated knowledge base for ecosystems
- `lib/data/animal-data.ts` - Animal options and related data
- `lib/utils/speech-utils.ts` - Utility functions for speech processing
- `lib/utils/validation.ts` - Sentence validation utilities
- `types/activity.ts` - TypeScript types for activity data structures

### Existing Files to Modify
- `components/lesson-layout.tsx` - May need enhancement for activity-specific features
- `app/lessons/how-machines-learn/page.tsx` - Update to link to new activity

### Test Files
- `components/activity/__tests__/ecosystem-selection-step.test.tsx`
- `components/activity/__tests__/understanding-check-step.test.tsx`
- `components/activity/__tests__/animal-selection-step.test.tsx`
- `components/activity/__tests__/audio-recorder.test.tsx`
- `lib/ml/__tests__/concept-extractor.test.ts`
- `lib/ml/__tests__/ecosystem-predictor.test.ts`
- `hooks/__tests__/use-speech-recognition.test.ts`

### Notes
- Unit tests should be placed in `__tests__` directories within each module
- Use `npm test` or `npx jest` to run tests
- Follow existing patterns from `LessonLayout` and `LessonNav` for navigation
- Ensure all components are responsive for iPad and iPhone

## Tasks

- [x] 1.0 Set up project infrastructure and data models
  - [x] 1.1 Create `types/activity.ts` with TypeScript interfaces for Activity, Step, Ecosystem, Animal, Sentence, MindmapNode, PredictionResult
  - [x] 1.2 Create `lib/data/ecosystem-knowledge.ts` with pre-populated knowledge base containing facts for all 5 ecosystems (Desert, Ocean, Rainforest, Grassland, Tundra) with associated sentences and color-coded concepts
  - [x] 1.3 Create `lib/data/animal-data.ts` with animal options (Bees, Dolphins, Monkeys, Zebras) and their habitat characteristics
  - [x] 1.4 Set up activity state management structure (consider using React Context or Zustand for global activity state)
  - [x] 1.5 Create `lib/utils/validation.ts` with functions to validate sentence quality (contains subject/predicate, relates to selected animal, minimum word count)

- [ ] 2.0 Implement speech recognition and audio system
  - [ ] 2.1 Create `hooks/use-speech-recognition.ts` custom hook implementing Web Speech API with start/stop recording, transcript state, error handling, and browser compatibility checks
  - [ ] 2.2 Create `hooks/use-text-to-speech.ts` custom hook for TTS with speak/pause/stop functions, voice selection (child-friendly), and audio queue management
  - [ ] 2.3 Create `components/activity/audio-recorder.tsx` reusable component with microphone button, pulsing animation for listening state, visual waveform or indicator, and transcript display
  - [ ] 2.4 Implement microphone permission request flow with user-friendly error messages for denied/unavailable permissions
  - [ ] 2.5 Create `lib/utils/speech-utils.ts` with utility functions for audio processing, transcript cleaning, and speech-to-text confidence scoring
  - [ ] 2.6 Add fallback handling for browsers without Web Speech API support (graceful degradation message)

- [ ] 3.0 Build activity step components (Steps 1-4: Setup phase)
  - [ ] 3.1 Create `components/activity/introduction-step.tsx` with Zhorai character image, title, description, Continue button, and Test Microphone button that opens a modal for mic testing
  - [ ] 3.2 Create `components/activity/ecosystem-selection-step.tsx` with ecosystem list (Desert, Ocean, Rainforest, Grassland, Tundra), "Press and speak" button integrated with audio recorder, example question display, and speech-to-text ecosystem detection logic
  - [ ] 3.3 Create `components/activity/knowledge-visualization-step.tsx` with Zhorai's response message, mindmap component for pre-existing knowledge, hover/touch tooltips for nodes, Continue and "Try another ecosystem" buttons
  - [ ] 3.4 Create `components/activity/understanding-check-step.tsx` with condensed mindmap view, question display, multi-select checkboxes for answer options, Submit button, and feedback logic for correct/incorrect selections
  - [ ] 3.5 Create `components/activity/animal-selection-step.tsx` with context text, radio button list of animals, Zhorai character display, dynamic speech bubble based on selection, and Continue button

- [ ] 4.0 Build teaching phase components (Steps 5-6: Sentence collection)
  - [ ] 4.1 Create `components/activity/sentence-input-step.tsx` with heading showing selected animal, "Press and speak to add" button with add icon, "See Zhorai's brain" button (disabled until 3 sentences), real-time sentence count display, and integration with audio recorder
  - [ ] 4.2 Create `components/activity/sentence-list-step.tsx` with sentence cards in rounded rectangles, hover state showing Edit/Delete icons, edit modal/inline for re-recording or typing correction, delete confirmation, purple background for first/selected card (#F4F0FF), and minimum 3 sentences validation
  - [ ] 4.3 Implement sentence storage in activity state with add, edit, delete, and retrieve functions
  - [ ] 4.4 Add sentence validation on submission (check quality, relevance to animal, duplicate detection)
  - [ ] 4.5 Create empty state UI for when no sentences have been added yet

- [ ] 5.0 Implement ML models and visualizations (Steps 7-8)
  - [ ] 5.1 Create `lib/ml/concept-extractor.ts` with NLP logic to extract key nouns, verbs, and relationships from sentences (use simple keyword extraction, regex patterns, or lightweight NLP library)
  - [ ] 5.2 Create `components/activity/mindmap-visualization.tsx` with interactive mindmap using D3.js, React Flow, or similar library; nodes for concepts with size based on importance; color coding (blue for abundance, orange for scarcity); connections showing relationships; hover/touch interaction for details; zoom/pan functionality
  - [ ] 5.3 Create `components/activity/mindmap-display-step.tsx` integrating mindmap component with Zhorai's message, condensed sentence list, and navigation buttons
  - [ ] 5.4 Create `lib/ml/ecosystem-predictor.ts` with prediction algorithm that extracts habitat keywords from sentences, matches against ecosystem characteristics, calculates confidence scores, and normalizes to probability distribution
  - [ ] 5.5 Create `components/activity/probability-chart.tsx` with horizontal/vertical bar chart showing probabilities for each ecosystem, hover tooltips displaying influencing sentences, and animated bar growth
  - [ ] 5.6 Create `components/activity/prediction-step.tsx` with prompt to ask Zhorai, audio recorder integration, probability chart display, Zhorai's verbal response with confidence language, and explanation of prediction reasoning

- [ ] 6.0 Integrate all steps into activity flow
  - [ ] 6.1 Create `app/lessons/how-machines-learn/ecosystem-activity/page.tsx` as main activity page component with all 8 step components wrapped in array
  - [ ] 6.2 Integrate with existing `LessonLayout` component or create custom activity layout with step navigation, progress indicator (purple bars), Previous/Next buttons, and Close (X) button
  - [ ] 6.3 Implement activity state management across all steps with React Context provider wrapping activity page, state persistence during navigation, and step validation before proceeding
  - [ ] 6.4 Add step transition logic with validation checks (e.g., can't proceed without 3 sentences), smooth animations between steps, and disabled Previous button on first step
  - [ ] 6.5 Implement completion screen (after Step 8) showing summary of what Zhorai learned, congratulations message, and "Continue to next activity" button
  - [ ] 6.6 Update `app/lessons/how-machines-learn/page.tsx` to link to new ecosystem activity page

- [ ] 7.0 Add animations, polish, and responsive design
  - [ ] 7.1 Create `components/activity/zhorai-character.tsx` with Zhorai SVG/image, animated expressions (happy, confused, excited), smooth transitions between states, and idle animation
  - [ ] 7.2 Implement microphone listening animation with pulsing effect on button and optional waveform visualization
  - [ ] 7.3 Add smooth animations for mindmap node appearance, sentence card hover effects, button pressed states, and step transitions
  - [ ] 7.4 Ensure all components are responsive for iPad landscape (1024x768), iPad portrait (768x1024), iPhone (375x667 minimum), using Tailwind breakpoints
  - [ ] 7.5 Implement touch-friendly interactions with 44x44pt minimum touch targets, long-press for additional options, and swipe gestures (optional)
  - [ ] 7.6 Add loading states for ML processing with spinner/skeleton and "Zhorai is thinking..." message
  - [ ] 7.7 Polish typography using Inter font (400 for body, 600 for headings) matching Figma specs
  - [ ] 7.8 Refine color scheme with purple accent (#967FD8), light purple background (#F4F0FF), black text (#000000), and white background (#FFFFFF)

- [ ] 8.0 Testing and quality assurance
  - [ ] 8.1 Write unit tests for `lib/ml/concept-extractor.ts` covering various sentence inputs and expected concept extraction
  - [ ] 8.2 Write unit tests for `lib/ml/ecosystem-predictor.ts` testing prediction algorithm with known sentence/ecosystem pairs
  - [ ] 8.3 Write component tests for `ecosystem-selection-step.tsx` testing ecosystem selection flow
  - [ ] 8.4 Write component tests for `understanding-check-step.tsx` testing answer selection and validation
  - [ ] 8.5 Write component tests for `animal-selection-step.tsx` testing animal selection and speech bubble updates
  - [ ] 8.6 Write tests for `use-speech-recognition` hook using mock Web Speech API
  - [ ] 8.7 Write integration tests for complete activity flow from introduction to completion
  - [ ] 8.8 Manual testing on actual devices: iPad Air, iPad Pro, iPhone 14, iPhone SE with Safari browser
  - [ ] 8.9 Test microphone permissions on different iOS versions (15+)
  - [ ] 8.10 Accessibility testing: VoiceOver support, keyboard navigation, color contrast (WCAG AA), and caption synchronization
  - [ ] 8.11 Performance testing: measure ML processing time (<2s target), audio latency (<500ms target), and animation frame rate (60fps target)
  - [ ] 8.12 Edge case testing: poor speech recognition, no internet connection, browser incompatibility, and timeout handling

