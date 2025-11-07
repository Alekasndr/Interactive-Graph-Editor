import { useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../stores/StoreContext';

const GraphCanvas = observer(() => {
  const graphStore = useGraphStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(graphStore.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphStore.edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
});

export default GraphCanvas;
