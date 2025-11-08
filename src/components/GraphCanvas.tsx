import { useCallback, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../stores/StoreContext';
import NodeCreationModal from './NodeCreationModal';

const GraphCanvas = observer(() => {
  const graphStore = useGraphStore();
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(graphStore.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphStore.edges);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    screenPosition: { x: number; y: number };
    flowPosition: { x: number; y: number };
  }>({
    isOpen: false,
    screenPosition: { x: 0, y: 0 },
    flowPosition: { x: 0, y: 0 },
  });

  useEffect(() => {
    setNodes(graphStore.nodes);
  }, [graphStore.nodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
        nodes={nodes}
        edges={edges}
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
