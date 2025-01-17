import { RootStore } from "store/root.store";
import { IProjectPublishStore, ProjectPublishStore } from "./project-publish.store";
import { IProjectStore, ProjectStore } from "./project.store";

export interface IProjectRootStore {
  project: IProjectStore;
  publish: IProjectPublishStore;
}

export class ProjectRootStore {
  project: IProjectStore;
  publish: IProjectPublishStore;

  constructor(_root: RootStore) {
    this.project = new ProjectStore(_root);
    this.publish = new ProjectPublishStore(this);
  }
}
