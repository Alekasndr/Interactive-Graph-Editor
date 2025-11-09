import { Node, Edge } from 'reactflow';

export type GraphNode = Node<{
  label: string;
}>;

export type GraphEdge = Edge<{
  weight?: number;
}>;

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
