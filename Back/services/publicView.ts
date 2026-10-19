// What the server sends about users and rooms to OTHER people (REST lists and broadcasts).
// A user's sessionId is their login credential: sending it out lets anyone take over the account.
// A room's password stays on the server (joining checks it there).

export type PublicUser = Omit<User, 'sessionId'>;
export type PublicRoom = Omit<Room, 'password' | 'users' | 'characters'> & {
    users: { [id: string]: PublicUser };
    characters: { [id: string]: PublicUser };
};

export const publicUser = (user: User): PublicUser => {
    const { sessionId, ...rest } = user;
    return rest;
}

const mapUsers = (users: { [id: string]: User } = {}) =>
    Object.fromEntries(Object.entries(users).map(([key, user]) => [key, publicUser(user)]));

export const publicRoom = (room: Room): PublicRoom => {
    const { password, users, characters, ...rest } = room;
    return { ...rest, users: mapUsers(users), characters: mapUsers(characters) };
}
