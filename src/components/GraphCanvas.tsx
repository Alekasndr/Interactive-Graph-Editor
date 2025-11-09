import { useCallback, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  Connection,
  BackgroundVariant,
  useReactFlow,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../stores/StoreContext';
import NodeCreationModal from './NodeCreationModal';
import SearchBar from './SearchBar';
import EdgePropertiesModal from './EdgePropertiesModal';
import PathFindingButton from './PathFindingButton';
import PathFindingInstructionsModal from './PathFindingInstructionsModal';

const GraphCanvas = observer(() => {
  const graphStore = useGraphStore();
  const { screenToFlowPosition } = useReactFlow();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    screenPosition: { x: number; y: number };
    flowPosition: { x: number; y: number };
  }>({
    isOpen: false,
    screenPosition: { x: 0, y: 0 },
    flowPosition: { x: 0, y: 0 },
  });
  const [edgeModalState, setEdgeModalState] = useState<{
    isOpen: boolean;
    screenPosition: { x: number; y: number };
    edgeId: string | null;
    weight?: number;
  }>({
    isOpen: false,
    screenPosition: { x: 0, y: 0 },
    edgeId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [pathFindingMode, setPathFindingMode] = useState(false);
  const [pathFindingState, setPathFindingState] = useState<{
    startNodeId: string | null;
    highlightedPath: string[];
  }>({
    startNodeId: null,
    highlightedPath: [],
  });
  const [showInstructions, setShowInstructions] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      graphStore.updateNodes(applyNodeChanges(changes, graphStore.nodes));
    },
    [graphStore]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      graphStore.updateEdges(applyEdgeChanges(changes, graphStore.edges));
    },
    [graphStore]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, graphStore.edges);
      const addedEdge = newEdge[newEdge.length - 1];

      if (addedEdge) {
        graphStore.updateEdges(newEdge);
        setTimeout(() => {
          graphStore.updateEdgeProperties(addedEdge.id, 1);
        }, 0);
      }
    },
    [graphStore]
  );

  const onConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const onConnectEnd = useCallback(() => {
    // Reset with delay to prevent modal opening after connection
    setTimeout(() => setIsConnecting(false), 300);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'd' || event.key === 'D') {
        const selectedNodes = graphStore.nodes.filter(node => node.selected);
        const selectedEdges = graphStore.edges.filter(edge => edge.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();

          if (selectedNodes.length > 0) {
            const nodeIds = selectedNodes.map(node => node.id);
            graphStore.deleteNodes(nodeIds);
          }

          if (selectedEdges.length > 0) {
            const edgeIds = selectedEdges.map(edge => edge.id);
            graphStore.deleteEdges(edgeIds);
          }
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.search-bar-container')) {
        return;
      }
      graphStore.setSearchQuery('');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [graphStore]);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isConnecting) {
        return;
      }

      const screenPosition = {
        x: event.clientX,
        y: event.clientY,
      };
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setModalState({
        isOpen: true,
        screenPosition,
        flowPosition,
      });
    },
    [screenToFlowPosition, isConnecting]
  );

  const handleModalSubmit = useCallback(
    (label: string, setError: (error: string) => void) => {
      const result = graphStore.addNode(label, modalState.flowPosition);
      if (result.success) {
        setModalState({ ...modalState, isOpen: false });
      } else if (result.error) {
        setError(result.error);
      }
    },
    [graphStore, modalState]
  );

  const handleModalCancel = useCallback(() => {
    setModalState({ ...modalState, isOpen: false });
  }, [modalState]);

  const onEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setEdgeModalState({
        isOpen: true,
        screenPosition: { x: event.clientX, y: event.clientY },
        edgeId: edge.id,
        weight: edge.data?.weight,
      });
    },
    []
  );

  const handleEdgeModalSubmit = useCallback(
    (edgeId: string, weight?: number) => {
      graphStore.updateEdgeProperties(edgeId, weight);
      setEdgeModalState({ ...edgeModalState, isOpen: false });
    },
    [graphStore, edgeModalState]
  );

  const handleEdgeModalCancel = useCallback(() => {
    setEdgeModalState({ ...edgeModalState, isOpen: false });
  }, [edgeModalState]);

  const handlePathFindingClick = useCallback(() => {
    const firstTimeKey = 'pathfinding-instructions-seen';
    const hasSeenInstructions = localStorage.getItem(firstTimeKey);

    if (!hasSeenInstructions) {
      setShowInstructions(true);
      localStorage.setItem(firstTimeKey, 'true');
    }

    setPathFindingMode(!pathFindingMode);
    setPathFindingState({ startNodeId: null, highlightedPath: [] });
  }, [pathFindingMode]);

  const handleNodeClickForPathFinding = useCallback(
    (nodeId: string) => {
      if (!pathFindingState.startNodeId) {
        setPathFindingState({ startNodeId: nodeId, highlightedPath: [] });
      } else if (pathFindingState.startNodeId === nodeId) {
        alert('Please select a different node as the destination!');
      } else {
        const result = graphStore.findShortestPath(pathFindingState.startNodeId, nodeId);

        if (result) {
          setPathFindingState({ startNodeId: null, highlightedPath: result.path });
          alert(`Shortest path found!\nDistance: ${result.distance}\nPath length: ${result.path.length} nodes`);

          setTimeout(() => {
            setPathFindingState({ startNodeId: null, highlightedPath: [] });
          }, 5000);
        } else {
          alert('No path exists between these nodes!');
          setPathFindingState({ startNodeId: null, highlightedPath: [] });
        }
        setPathFindingMode(false);
      }
    },
    [pathFindingState, graphStore]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (pathFindingMode) {
        event.stopPropagation();
        handleNodeClickForPathFinding(node.id);
      }
    },
    [pathFindingMode, handleNodeClickForPathFinding]
  );

  const nodesWithHighlight = graphStore.nodes.map(node => {
    let className = '';

    if (node.id === graphStore.highlightedNodeId) {
      className = 'highlighted-node';
    }

    if (pathFindingState.highlightedPath.includes(node.id)) {
      className += ' path-node';
    }

    if (pathFindingState.startNodeId === node.id) {
      className += ' start-node';
    }

    return {
      ...node,
      className: className.trim(),
    };
  });

  const edgesWithHighlight = graphStore.edges.map(edge => {
    const isInPath = pathFindingState.highlightedPath.length > 0 &&
      pathFindingState.highlightedPath.some((nodeId, index) => {
        if (index === pathFindingState.highlightedPath.length - 1) return false;
        const nextNodeId = pathFindingState.highlightedPath[index + 1];
        return (
          (edge.source === nodeId && edge.target === nextNodeId) ||
          (edge.source === nextNodeId && edge.target === nodeId)
        );
      });

    return {
      ...edge,
      className: isInPath ? 'path-edge' : '',
    };
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SearchBar />
      <PathFindingButton onClick={handlePathFindingClick} isActive={pathFindingMode} />
      <ReactFlow
        nodes={nodesWithHighlight}
        edges={edgesWithHighlight}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onPaneClick={onPaneClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <NodeCreationModal
        isOpen={modalState.isOpen}
        position={modalState.screenPosition}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
      />
      <EdgePropertiesModal
        isOpen={edgeModalState.isOpen}
        position={edgeModalState.screenPosition}
        edgeId={edgeModalState.edgeId}
        currentWeight={edgeModalState.weight}
        onSubmit={handleEdgeModalSubmit}
        onCancel={handleEdgeModalCancel}
      />
      <PathFindingInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
});

export default GraphCanvas;
