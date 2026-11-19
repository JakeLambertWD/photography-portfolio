import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignInContainer from "@/app/components/signin/SignInContainer";
import { redirectIfSignedIn } from "@/server/session";

// Private route
export default async function SignInPage() {
  // If the user is already signed in, redirect them to the /collaborate page
  await redirectIfSignedIn();

  return (
    <ProjectorBeamContainer>
      <SignInContainer />
    </ProjectorBeamContainer>
  );
}
