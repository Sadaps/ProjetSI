<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260503200359 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE contenir DROP poids_attendu');
        $this->addSql('ALTER TABLE lots ADD contenance_restante DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE lots DROP poids');
        $this->addSql('ALTER TABLE lots DROP quantite');
        $this->addSql('ALTER TABLE produit ALTER quantite_totale TYPE DOUBLE PRECISION');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE contenir ADD poids_attendu NUMERIC(15, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE lots ADD poids NUMERIC(15, 2) DEFAULT NULL');
        $this->addSql('ALTER TABLE lots ADD quantite INT NOT NULL');
        $this->addSql('ALTER TABLE lots DROP contenance_restante');
        $this->addSql('ALTER TABLE produit ALTER quantite_totale TYPE INT');
    }
}
