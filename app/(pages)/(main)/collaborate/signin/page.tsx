import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignInContainer from "@/app/components/signin/SignInContainer";
import { redirectIfSignedIn } from "@/server/session";

export default async function SignInPage() {
  await redirectIfSignedIn();

  return (
    <ProjectorBeamContainer>
      <SignInContainer />
    </ProjectorBeamContainer>
  );
}
