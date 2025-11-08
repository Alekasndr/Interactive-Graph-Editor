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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../stores/StoreContext';
import NodeCreationModal from './NodeCreationModal';

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
      graphStore.updateEdges(addEdge(params, graphStore.edges));
    },
    [graphStore]
  );

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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [graphStore]);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
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
    [screenToFlowPosition]
  );

  const handleModalSubmit = useCallback(
    (label: string) => {
      const result = graphStore.addNode(label, modalState.flowPosition);
      if (result.success) {
        setModalState({ ...modalState, isOpen: false });
      }
    },
    [graphStore, modalState]
  );

  const handleModalCancel = useCallback(() => {
    setModalState({ ...modalState, isOpen: false });
  }, [modalState]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={graphStore.nodes}
        edges={graphStore.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
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
    </div>
  );
});

export default GraphCanvas;
