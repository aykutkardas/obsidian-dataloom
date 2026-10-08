import LoomStateCommand from "./loom-state-command";
import { LoomState } from "../types/loom-state";

export default class FilterDisableAllCommand extends LoomStateCommand {
 constructor() { super(false, { shouldSaveFrontmatter: false }); }
 execute(prevState: LoomState): LoomState {
  const nextState = { ...prevState, model: { ...prevState.model,
   filters: prevState.model.filters.map(filter => filter.isEnabled ? { ...filter, isEnabled: false } : filter),
  } };
  this.finishExecute(prevState, nextState);
  return nextState;
 }
}
