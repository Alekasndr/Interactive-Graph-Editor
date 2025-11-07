import { makeAutoObservable } from 'mobx';
import { GraphNode, GraphEdge } from '../types/graph.types';

class GraphStore {
  nodes: GraphNode[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 400, y: 200 },
      data: { label: 'Node 2' },
    },
  ];

  edges: GraphEdge[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export default GraphStore;
