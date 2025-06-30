import { EtlInput, EtlType } from './sharedinterface';
import { muEtl } from './muEtl';
import { Database } from './database';
import { Logger } from './logging';
import * as path from 'path';

async function main() {
    const logger = new Logger();
    
    try {
        // Create database instance directly since config is already in Database class
        const db = new Database({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            database: '20749'
        });
        const etl = new muEtl(EtlType.muEtl, logger, db);

        // Configure ETL input for local file
        const localMsg: EtlInput = {
            sourceType: 'CSV',
            dataLocation: path.resolve(__dirname, 'AppOmni_IssueFile.csv'),
            dataSource: 'LOCAL'
        };

        // Process ETL
        logger.info('Starting ETL process...');
        const result = await etl.etlProcess(localMsg);

        // Handle result
        if (result.etlStopped) {
            logger.error(`ETL process stopped: ${result.message}`);
        } else {
            logger.info(`ETL process completed. Processed issues: ${result.issueIds.length}`);
        }

    } catch (error) {
        logger.error(`ETL process failed: ${error}`);
    }
}

main().catch(console.error);