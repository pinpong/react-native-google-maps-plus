// Trims the API reference:
// - the package comment is the guide, the guide pages already show it
// - members inherited from Nitro's HybridObject/HybridView are not part of the API
// - an optional prop without a default shows an empty cell, not `undefined`
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

export function load(app) {
  app.converter.on('resolveEnd', (context) => {
    const { project } = context;
    project.comment = undefined;
    for (const reflection of Object.values(project.reflections)) {
      if (reflection.inheritedFrom && !reflection.implementationOf) {
        project.removeReflection(reflection);
      }
    }
  });

  app.renderer.on(MarkdownPageEvent.END, (page) => {
    page.contents = page.contents?.replace(/ \| `undefined` \| /g, ' | | ');
  });
}
