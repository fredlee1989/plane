import { FC } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import useSWR from "swr";
// hooks
import { Breadcrumbs, LayersIcon } from "@plane/ui";
import { BreadcrumbLink } from "components/common";
import { SidebarHamburgerToggle } from "components/core/sidebar/sidebar-menu-hamburger-toggle";
import { ISSUE_DETAILS } from "constants/fetch-keys";
import { useProject } from "hooks/store";
// components
import { ProjectLogo } from "components/project";
// ui
// types
import { IssueArchiveService } from "services/issue";
// constants
// services
// helpers
// components

const issueArchiveService = new IssueArchiveService();

export const ProjectArchivedIssueDetailsHeader: FC = observer(() => {
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, archivedIssueId } = router.query;
  // store hooks
  const { currentProjectDetails } = useProject();

  const { data: issueDetails } = useSWR(
    workspaceSlug && projectId && archivedIssueId ? ISSUE_DETAILS(archivedIssueId as string) : null,
    workspaceSlug && projectId && archivedIssueId
      ? () =>
          issueArchiveService.retrieveArchivedIssue(
            workspaceSlug as string,
            projectId as string,
            archivedIssueId as string
          )
      : null
  );

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
                <BreadcrumbLink
                  href={`/${workspaceSlug}/projects/${projectId}/archived-issues`}
                  label="Archived issues"
                  icon={<LayersIcon className="h-4 w-4 text-custom-text-300" />}
                />
              }
            />

            <Breadcrumbs.BreadcrumbItem
              type="text"
              link={
                <BreadcrumbLink
                  label={
                    currentProjectDetails && issueDetails
                      ? `${currentProjectDetails.identifier}-${issueDetails.sequence_id}`
                      : ""
                  }
                />
              }
            />
          </Breadcrumbs>
        </div>
      </div>
    </div>
  );
});
