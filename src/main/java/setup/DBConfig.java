package setup;

import java.io.FileInputStream;
import java.util.Properties;

public class DBConfig {

    public static String host;
    public static String port;
    public static String user;
    public static String pass;

    static {
        try {
            Properties p = new Properties();
            p.load(new FileInputStream("dbconfig.properties"));

            host = p.getProperty("host");
            port = p.getProperty("port");
            user = p.getProperty("user");
            pass = p.getProperty("pass");

        } catch (Exception e) {
            System.out.println("Could not load dbconfig.properties");
            e.printStackTrace();
        }
    }
}
