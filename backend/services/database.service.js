import { v4 as uuidv4 } from 'uuid';

// --- In-Memory Database Store ---
let users = [];
let tournaments = [];

// --- User Functions ---
export const findUserByUsername = (username) => {
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
};

export const createUser = (username, password) => {
    // Storing password in plaintext is insecure and for demonstration purposes only.
    // In a real application, you MUST hash and salt passwords.
    const newUser = { id: `u-${uuidv4()}`, username, password };
    users.push(newUser);
    return newUser;
};

// --- Tournament Functions ---
export const getAllTournaments = () => {
    return tournaments;
};

export const getTournamentById = (id) => {
    return tournaments.find(t => t.id === id);
};

export const createTournament = (tournamentData) => {
    const newTournament = { ...tournamentData, id: uuidv4() };
    tournaments.push(newTournament);
    return newTournament;
};

export const updateTournament = (id, updatedData) => {
    const index = tournaments.findIndex(t => t.id === id);
    if (index > -1) {
        // Ensure the ID from the URL is respected and not overwritten by the body
        tournaments[index] = { ...updatedData, id };
        return tournaments[index];
    }
    return null;
};