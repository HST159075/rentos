import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
});
