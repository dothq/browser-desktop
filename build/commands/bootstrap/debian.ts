import execa from 'execa'

export async function aptInstall(...packages: string[]): Promise<string> {
  return (await execa('sudo', ['apt', 'install', '-y', ...packages])).stdout
}
