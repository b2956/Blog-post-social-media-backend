const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input UserLoginInput {
        email: String!
        password: String!
    }

    input CreatePostInput {
        title: String!
        content: String!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type GetPostsData {
        posts: [Post!]!
        totalPosts: Int!
    }

    type RootQuery {
        loginUser(loginInput: UserLoginInput) : AuthData!
        getPosts: GetPostsData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: CreatePostInput): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);