/**
 * [INPUT]: 依赖 Deno runtime env 与 ./handler 的 createMedicalDocumentOcrHandler。
 * [OUTPUT]: 启动 medical-document-ocr Supabase Edge Function。
 * [POS]: supabase/functions/medical-document-ocr 的 Deno 壳层，仅负责把运行时 env 交给可测试 handler。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createMedicalDocumentOcrHandler } from './handler.ts'

type DenoRuntime = {
  env: {
    get(name: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

const denoRuntime = (globalThis as typeof globalThis & { Deno?: DenoRuntime }).Deno

if (!denoRuntime) {
  throw new Error('Deno runtime is required for medical-document-ocr.')
}

denoRuntime.serve(createMedicalDocumentOcrHandler({ env: denoRuntime.env }))
