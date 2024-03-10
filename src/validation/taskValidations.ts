import Task from '../models/Task'

export function validateColorString(colorString?: string): colorString is string {
    if (typeof colorString !== 'string') {
        return false
    }
    return colorString.length === 8 && !!colorString.match(/([0-9A-F]{8})/i)
}

export async function validateTaskNameNotTaken(newName?: string) {
    const task = await Task.findOne({ where: { taskName: newName } })
    return !task
}