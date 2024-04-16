export const staticTemplate = (
  staticPage: string,
  bundleName: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root">
    ${staticPage}
    </div>
    <script type="text/javascript" src="${bundleName}"></script>
</body>
</html>
`;
