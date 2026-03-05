package setup;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Scanner;

public class Setup {

    public static void main(String[] args) {
        new Setup().runSetup();
    }

    public void runSetup() {
        try (Scanner sc = new Scanner(System.in)) {
            try {
                System.out.println("========= ERP MULTI-DATABASE SETUP =========");

                System.out.print("MySQL Host (default: localhost): ");
                String host = sc.nextLine().trim();
                if (host.isEmpty())
                    host = "localhost";

                System.out.print("MySQL Port (default: 3306): ");
                String port = sc.nextLine().trim();
                if (port.isEmpty())
                    port = "3306";

                System.out.print("MySQL Username: ");
                String username = sc.nextLine().trim();

                System.out.print("MySQL Password: ");
                String password = sc.nextLine().trim();

                System.out.println("\nConnecting to MySQL...");

                Class.forName("com.mysql.cj.jdbc.Driver");

                String url = "jdbc:mysql://" + host + ":" + port + "/?allowMultiQueries=true";
                Connection con = DriverManager.getConnection(url, username, password);
                Statement st = con.createStatement();

                System.out.println("Creating databases (if not exist)...");
                st.executeUpdate("CREATE DATABASE IF NOT EXISTS erp_auth;");
                st.executeUpdate("CREATE DATABASE IF NOT EXISTS erp_main;");
                System.out.println("Databases ready.\n");

                System.out.println("Importing csr_auth.sql ...");
                st.execute("USE csr_auth;");
                importSQL(st, "csr_auth.sql");
                System.out.println("Imported csr_auth.sql successfully.\n");

                System.out.println("Importing csr_db.sql ...");
                st.execute("USE csr_db;");
                importSQL(st, "csr_db.sql");
                System.out.println("Imported csr_db.sql successfully.\n");

                System.out.println("========= SETUP COMPLETED SUCCESSFULLY =========");
                saveConfig(host, port, username, password);

            } catch (Exception e) {
                System.out.println("Setup failed:");
                e.printStackTrace();
            }
        }
    }

    private void saveConfig(String host, String port, String user, String pass) {
        try {
            String data = "host=" + host + "\n" +
                    "port=" + port + "\n" +
                    "user=" + user + "\n" +
                    "pass=" + pass + "\n";

            java.nio.file.Files.write(
                    java.nio.file.Path.of("dbconfig.properties"),
                    data.getBytes());

            System.out.println("Saved DB credentials to dbconfig.properties");

        } catch (Exception e) {
            System.out.println("Failed to save DB credentials:");
            e.printStackTrace();
        }
    }

    private void importSQL(Statement st, String filename) throws Exception {
        InputStream is = getClass().getClassLoader().getResourceAsStream(filename);

        if (is == null) {
            throw new RuntimeException("Could not find SQL file: " + filename);
        }

        String sql = new String(is.readAllBytes());
        st.execute(sql);
    }
}

