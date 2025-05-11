import { HandleErrorNode } from './nodes/handleError/handleError.node';
import { NodesAbstract } from './nodes/nodes.abstract';

export const nextOrErrorNode = async (
  state,
  nextNode,
  fallbackNode: string = HandleErrorNode.name,
) => {
  return state.error ? fallbackNode : nextNode;
};
