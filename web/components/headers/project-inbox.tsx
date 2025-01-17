import { FC, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
// hooks
// ui
import { Breadcrumbs, Button, LayersIcon } from "@plane/ui";
// components
import { BreadcrumbLink } from "components/common";
import { SidebarHamburgerToggle } from "components/core/sidebar/sidebar-menu-hamburger-toggle";
import { CreateInboxIssueModal } from "components/inbox";
// helper
import { useProject } from "hooks/store";
import { ProjectLogo } from "components/project";

export const ProjectInboxHeader: FC = observer(() => {
  // states
  const [createIssueModal, setCreateIssueModal] = useState(false);
  // router
  const router = useRouter();
  const { workspaceSlug } = router.query;
  // store hooks
  const { currentProjectDetails } = useProject();

  return (
    <div className="relative z-10 flex h-[3.75rem] w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 border-b border-custom-border-200 bg-custom-sidebar-background-100 p-4">
      <div className="flex w-full flex-grow items-center gap-2 overflow-ellipsis whitespace-nowrap">
        <SidebarHamburgerToggle />
        <div>
          <Breadcrumbs>
            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink
                  href={`/${workspaceSlug}/projects`}
                  label={currentProjectDetails?.name ?? "Project"}
                  icon={
                    currentProjectDetails && (
                      <span className="grid place-items-center flex-shrink-0 h-4 w-4">
                        <ProjectLogo logo={currentProjectDetails?.logo_props} className="text-sm" />
                      </span>
                    )
                  }
                />
              }
            />

            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink label="Inbox Issues" icon={<LayersIcon className="h-4 w-4 text-custom-text-300" />} />
              }
            />
          </Breadcrumbs>
        </div>
      </div>

      {currentProjectDetails?.inbox_view && (
        <div className="flex items-center gap-2">
          <CreateInboxIssueModal isOpen={createIssueModal} onClose={() => setCreateIssueModal(false)} />
          <Button variant="primary" prependIcon={<Plus />} size="sm" onClick={() => setCreateIssueModal(true)}>
            Add Issue
          </Button>
        </div>
      )}
    </div>
  );
});
