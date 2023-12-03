import { z } from 'zod';
import fs from 'fs/promises';
import { DynamicStructuredTool } from 'langchain/tools';

function writeReport({ filename, html }) {
  return fs.writeFile(filename, html);
}

export const writeReportTool = new DynamicStructuredTool({
  name: 'writeReport',
  description:
    'Write an HTML file to disk. Use this tool whenever someone ask for a report',
  func: writeReport,
  schema: z.object({
    filename: z.string(),
    html: z.string(),
  }),
});
