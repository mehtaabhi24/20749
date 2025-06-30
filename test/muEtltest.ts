import { Database } from "../database";
import { Logger } from "../logging";
import { EtlType } from "../sharedinterface";
import { muEtl } from "../muEtl";


async function testConnection() {
    const logger = new Logger();
    
    try {
        const dbConfig = {
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: '20749'
        };

        const db = new Database(dbConfig);
        const etl = new muEtl(EtlType.AppOMNI, logger, db);
        
        logger.info('Testing database connection...');
        await etl.init();
        logger.info('Database connection successful!');
        
        // Close the connection
        // await db.close();
        logger.info('Connection closed');
    } catch (error) {
        logger.error(`Connection failed: ${error}`);
    }
}

testConnection();