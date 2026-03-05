package domain;

public class User {

    private int userId;
    private String username;
    private String passwordHash;
    private String status;

    public User() {}

    public User(int userId, String username, String passwordHash, String status) {
        this.userId = userId;
        this.username = username;
        this.passwordHash = passwordHash;
        this.status = status;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}