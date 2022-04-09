import SuperDoist from "./main";
import { Notice, parseYaml, TAbstractFile, TFile, TFolder } from "obsidian";
const Todoist = require('todoist').v8



export class Parser {

    plugin: SuperDoist
    api: Todoist
    projects: any[]

    constructor(plugin: SuperDoist) {
        this.plugin = plugin
        this.api = new TodoistSyncAPI(this.plugin)
    }

    async scan() {
        if (!await this.api.getProjects()) {
            new Notice("API token is invalid, try again")
            return 
        }
        let rootFolder: TAbstractFile = this.plugin.app.vault.getAbstractFileByPath(this.plugin.settings.rootProjectDir)
        if (rootFolder instanceof TFolder) {
            this.projects = await this.api.getProjects()
            for (let child of rootFolder.children) {
                if (child instanceof TFolder) this.recurseScanFiles(child, null)
                else if (child instanceof TFile) await this.parseIfTaskFile(child, null)
            }
        } else {
            new Notice("Root folder does not exist, scan again")
        }
    }

    async recurseScanFiles(projectFolder: TFolder, parentProjectId: number | null) {
        let existingProjects = this.projects.filter(p => p["parentId"] == parentProjectId && p["name"] == projectFolder.name)
        let projectId: number 
        if (!existingProjects.length) {
            let newProj = await this.api.addProject({
                name: projectFolder.name,
                parentId: parentProjectId
            })
            projectId = newProj.id
        } else {
            projectId = existingProjects[0]["id"]
        }

        for (let child of projectFolder.children) {
            if (child instanceof TFolder) this.recurseScanFiles(child, projectId)
            else if (child instanceof TFile) await this.parseIfTaskFile(child, projectId)
        }
    }

    async parseIfTaskFile(file: TFile, parentId: number) {
        let cache = this.plugin.app.metadataCache.getFileCache(file)
        
        if (cache.frontmatter) {
            let fmStart = cache.frontmatter.position.start.offset + 3
            let fmEnd = cache.frontmatter.position.end.offset - 3
            let fileText = await this.plugin.app.vault.read(file) 
            let fm = fileText.substring(fmStart, fmEnd) 
            let metadata = parseYaml(fm)

            if (metadata["type"] == "todoist") {

                let taskObject = Object.assign({}, metadata)

                if (cache.headings) taskObject["content"] = cache.headings[0].heading
                else taskObject["content"] = file.name
                taskObject["project_id"] = parentId
                delete taskObject["type"]
                
                if (metadata["taskId"]) {
                    let taskId = metadata["taskId"]
                    delete taskObject["taskId"]
                    await this.api.updateTask(taskId, taskObject) 
                } else {
                    let newTask = await this.api.addTask(taskObject)
                    let newFileText = [fileText.slice(0, fmEnd), `taskId: ${newTask.id}\n`, fileText.slice(fmEnd), "\n"].join("")
                    this.plugin.app.vault.modify(file, newFileText)
                }
            }
        }
    }
}