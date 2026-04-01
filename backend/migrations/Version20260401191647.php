<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260401191647 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande ADD fournisseur_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE commande ADD CONSTRAINT FK_6EEAA67D670C757F FOREIGN KEY (fournisseur_id) REFERENCES fournisseur (id)');
        $this->addSql('CREATE INDEX IDX_6EEAA67D670C757F ON commande (fournisseur_id)');
        $this->addSql('ALTER TABLE fournis_par ALTER prix SET NOT NULL');
        $this->addSql('ALTER TABLE fournis_par ALTER moq SET NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande DROP CONSTRAINT FK_6EEAA67D670C757F');
        $this->addSql('DROP INDEX IDX_6EEAA67D670C757F');
        $this->addSql('ALTER TABLE commande DROP fournisseur_id');
        $this->addSql('ALTER TABLE fournis_par ALTER prix DROP NOT NULL');
        $this->addSql('ALTER TABLE fournis_par ALTER moq DROP NOT NULL');
    }
}
