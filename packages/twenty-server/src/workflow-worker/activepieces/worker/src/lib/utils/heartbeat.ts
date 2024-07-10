import os from 'os'
import { networkUtls } from 'src/workflow-worker/activepieces/server-shared'
import { WorkerMachineHealthcheckRequest } from 'src/workflow-worker/activepieces/shared/src'

async function getSystemInfo(): Promise<WorkerMachineHealthcheckRequest> {
    const totalRamInBytes = os.totalmem()
    const freeRamInBytes = os.freemem()
    const ramInBytes = totalRamInBytes - freeRamInBytes
    const ramUsage = (ramInBytes / totalRamInBytes) * 100

    const cpus = os.cpus()
    const cpuUsage = cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
        const idle = cpu.times.idle
        return acc + (1 - idle / total)
    }, 0) / cpus.length * 100

    const ip = (await networkUtls.getPublicIp()).ip

    return {
        cpuUsagePercentage: cpuUsage,
        ramUsagePercentage: ramUsage,
        totalAvailableRamInBytes: totalRamInBytes,
        ip,
    }
}


export const heartbeat = {
    getSystemInfo,
}