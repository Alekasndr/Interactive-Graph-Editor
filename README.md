# Interactive Graph Editor

An interactive graph editor built with React 19, TypeScript, and React Flow that allows users to create, edit, and manage graph structures with nodes and edges.

**🚀 Live Demo**: [https://interactive-graph-editor.vercel.app/](https://interactive-graph-editor.vercel.app/)

Try the application directly in your browser - create nodes, connect edges, set weights, and find shortest paths using Dijkstra's algorithm!

## Features

- **Node Management**: Create nodes by clicking on the canvas background
- **Edge Creation**: Connect nodes by dragging between node handles
- **Edge Weights**: All edges have weights (default = 1), editable by double-clicking the edge
- **Path Finding**: Find shortest path between two nodes using Dijkstra's algorithm
- **Delete Operations**: Select nodes/edges and press Backspace to delete
- **Search Functionality**: Search for nodes by exact name match with visual highlighting
- **Persistent Storage**: Automatic save/load using browser's localStorage
- **Interactive Canvas**: Pan, zoom, and drag nodes freely

## How to Run the Project

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Running

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Design Decisions and Trade-offs

### Technology Stack
- **React 19**: Latest React version with improved performance and JSX transform
- **TypeScript**: Type safety and better developer experience
- **MobX**: Simple and scalable state management with minimal boilerplate
- **React Flow**: Robust graph visualization library with built-in features

### State Management
**Decision**: Used MobX for centralized state management instead of React's built-in state.

**Reasoning**:
- Reactive updates without complex dependency arrays
- Clean separation of business logic from UI components
- Easy to observe and react to state changes

**Trade-off**: Adds external dependency, but the simplicity of MobX's observable patterns outweighs the cost for this use case.

### Storage Strategy
**Decision**: localStorage for automatic persistence with JSON serialization.

**Reasoning**:
- Simple, browser-native solution
- No backend required
- Instant save/restore across sessions

**Trade-off**: Limited storage capacity (~5-10MB), data stored client-side only. For production, consider backend storage for multi-device sync and larger graphs.

### Node Creation UX
**Decision**: Modal popup on background click rather than toolbar button.

**Reasoning**:
- Creates node at clicked position (intuitive spatial mapping)
- Modal ensures valid node names before creation

**Trade-off**: Added complexity to prevent modal from opening during edge creation (requires connection state tracking).

### Search Implementation
**Decision**: Exact match search with button trigger rather than live filtering.

**Reasoning**:
- Clear "not found" feedback for user
- Prevents partial match confusion
- Button click makes search action explicit

### Deletion UX
**Decision**: Use React Flow's built-in Backspace key deletion.

**Reasoning**:
- Standard browser behavior (Backspace to delete)
- No custom event handlers needed
- Works for both nodes and edges uniformly
- Provided by React Flow out of the box

**Trade-off**: None - this is the standard deletion method for React Flow applications.

### Path Finding Algorithm
**Decision**: Dijkstra's algorithm for shortest path calculation.

**Reasoning**:
- Guarantees optimal solution for non-negative edge weights
- Well-understood and proven algorithm
- Reasonable performance for small-to-medium graphs (up to ~1000 nodes)
- Simple implementation without external dependencies

**Trade-off**: O(V² + E) time complexity without priority queue optimization. For very large graphs (10,000+ nodes), consider A* or bidirectional search with priority queue for better performance.

## Architecture

```
src/
├── components/                        # React components
│   ├── GraphCanvas.tsx                # Main graph visualization
│   ├── SearchBar.tsx                  # Node search with highlighting
│   ├── NodeCreationModal.tsx          # Node creation dialog
│   ├── EdgePropertiesModal.tsx        # Edge weight editor
│   ├── PathFindingButton.tsx          # Path-finding mode toggle
│   └── PathFindingInstructionsModal.tsx # First-time instructions
├── stores/                            # MobX stores
│   ├── GraphStore.ts                  # Core graph state and logic
│   └── StoreContext.tsx               # React context for store
├── types/
│   └── graph.types.ts                 # TypeScript type definitions
└── styles/                            # CSS modules
    ├── NodeCreationModal.css          # Shared modal styles
    ├── EdgePropertiesModal.css        # Edge modal specific styles
    └── PathFindingButton.css          # Path-finding button styles
```

### Key Components
- **GraphStore**: Central state management with MobX observables, handles graph operations, persistence, and Dijkstra's algorithm
- **GraphCanvas**: React Flow wrapper with event handlers for node/edge creation, deletion, interaction, and path-finding mode
- **NodeCreationModal**: Controlled form for node creation with validation and duplicate detection
- **EdgePropertiesModal**: Dialog for editing edge weights with numeric input validation (prevents negative values)
- **SearchBar**: Search interface with exact match and visual highlighting
- **PathFindingButton**: Toggle button for activating path-finding mode
- **PathFindingInstructionsModal**: One-time instructions modal for new users

## Known Limitations

1. **Storage Capacity**: localStorage has ~5-10MB limit; large graphs may exceed this
2. **No Undo/Redo**: Deletion operations are permanent (no history stack)
3. **Single Graph**: No support for multiple graph documents or tabs
4. **Basic Search**: Only supports exact name matching (case-insensitive)
5. **No Export**: Cannot export graph to external formats (JSON, PNG, etc.)
6. **Node ID Generation**: Simple incremental IDs; may conflict if nodes are deleted and recreated
7. **No Collision Detection**: Nodes can overlap freely

## Future Improvements

### High Priority
- **Undo/Redo System**: Implement command pattern with history stack
- **Export/Import**: Support JSON export and file upload for sharing graphs
- **Node Types**: Allow different node shapes/colors for categorization

### Medium Priority
- **Multi-Select**: Select multiple nodes with drag rectangle
- **Keyboard Shortcuts**: More shortcuts (Ctrl+Z, Ctrl+C, Ctrl+V)
- **Backend Integration**: API for server-side storage and collaboration

### Low Priority
- **Auto-Layout**: Algorithm to arrange nodes automatically
- **Themes**: Dark mode and custom color schemes
- **Touch Support**: Better mobile/tablet interaction
