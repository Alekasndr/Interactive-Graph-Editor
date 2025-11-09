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

  const nodesWithHighlight = graphStore.nodes.map(node => ({
    ...node,
    className: node.id === graphStore.highlightedNodeId ? 'highlighted-node' : '',
  }));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <SearchBar />
      <ReactFlow
        nodes={nodesWithHighlight}
        edges={graphStore.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onPaneClick={onPaneClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
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
    </div>
  );
});

export default GraphCanvas;
