import { requireUser, getCurrentCharacter } from "@/lib/session";
import { CreateCharacterForm } from "./CreateCharacterForm";
import { CharacterSheet } from "./CharacterSheet";

export default async function CharacterPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);

  if (!character) {
    return <CreateCharacterForm />;
  }

  return <CharacterSheet character={character} />;
}
