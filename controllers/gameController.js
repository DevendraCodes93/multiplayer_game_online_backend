const waitingPlayers = [];

export const createNewGame = (req, res) => {
  console.log("came");
  const { playerName, playerSocketId } = req.body;
  console.log("Player Name:", playerName);
  console.log("Player Socket ID:", playerSocketId);
  if (!playerName) {
    return res.status(400).json({ error: "Player name is required" });
  }
  const gameId = addPlayerToWaitingList(playerName);
  res
    .status(201)
    .json({ gameId, message: "Player added to waiting list", waitingPlayers });
};
const generateGameId = () => {
  //simple 6 digit random number
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const addPlayerToWaitingList = (playerName) => {
  const gameId = generateGameId();
  waitingPlayers.push({ playerName, gameId });
  return gameId;
};
