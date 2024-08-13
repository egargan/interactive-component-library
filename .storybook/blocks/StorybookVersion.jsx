export const StorybookVersion = () => {
  const versionText = import.meta.env.STORYBOOK_VERSION ?? "Development build"
  const versionUrl = import.meta.env.STORYBOOK_VERSION_URL

  if (versionUrl) {
    return (
      <pre>
        <a href={versionUrl}>{versionText}</a>
      </pre>
    )
  } else {
    return <pre>{versionText}</pre>
  }
}
