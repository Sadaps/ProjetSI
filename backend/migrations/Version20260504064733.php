<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260504064733 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fournisseur ADD mail VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE fournisseur ADD pays VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE fournisseur ADD ville VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE fournisseur ADD code_postal VARCHAR(50) DEFAULT NULL');
        $this->addSql('ALTER TABLE produit ADD seuil DOUBLE PRECISION DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE produit ADD categorie_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE produit ADD CONSTRAINT FK_29A5EC27BCF5E72D FOREIGN KEY (categorie_id) REFERENCES categorie (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_29A5EC27BCF5E72D ON produit (categorie_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE fournisseur DROP mail');
        $this->addSql('ALTER TABLE fournisseur DROP pays');
        $this->addSql('ALTER TABLE fournisseur DROP ville');
        $this->addSql('ALTER TABLE fournisseur DROP code_postal');
        $this->addSql('ALTER TABLE produit DROP CONSTRAINT FK_29A5EC27BCF5E72D');
        $this->addSql('DROP INDEX IDX_29A5EC27BCF5E72D');
        $this->addSql('ALTER TABLE produit DROP seuil');
        $this->addSql('ALTER TABLE produit DROP categorie_id');
    }
}
