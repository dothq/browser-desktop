import { BridgeCommand } from "./bridge";
import { BuildCommand } from "./build";
import { CommitCommand } from "./commit";
import { DownloadCommand } from "./download";
import { ExportCommand } from "./export";
import { ImportCommand } from "./import";
import { RunCommand } from "./run";
import { TestCommand } from "./test";
import { UndoCommand } from "./undo";

export const commands = [
	DownloadCommand,
	ExportCommand,
	BridgeCommand,
	CommitCommand,
	ImportCommand,
	BuildCommand,
	RunCommand,
	UndoCommand,
	TestCommand,
];
