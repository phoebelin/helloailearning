/**
 * Legacy route. The Zhorai activity now lives at /lessons/how-machines-learn
 * (see app/lessons/how-machines-learn/page.tsx). This redirect preserves any
 * old links or bookmarks that still point here.
 */
import { redirect } from 'next/navigation';

export default function TestActivityStepsRedirect() {
  redirect('/lessons/how-machines-learn');
}
