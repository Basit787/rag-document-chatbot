import { createFileRoute } from '@tanstack/react-router';
import { ChatView } from '@/components/ChatView';

export const Route = createFileRoute('/c/$threadId/')({
  component: Conversation,
});

function Conversation() {
  const { threadId } = Route.useParams();
  return <ChatView threadId={threadId} />;
}
